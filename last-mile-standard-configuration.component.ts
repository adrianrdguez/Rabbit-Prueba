import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreLastMile } from '@features/store/models/last-mile-option';
import { StoreComponent } from '@features/store/pages/store/store.component';
import { LastMileService } from '@features/store/services/last-mile.service';
import { StoreService } from '@features/store/services/store.service';
import { loader } from '@shared/rxjs-operators/loader.operator';
import { toaster } from '@shared/rxjs-operators/toast.operator';
import { Subject, of } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
/**
 *
 *
 * @export
 * @class LastMileStuartConfigurationComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'store-last-mile-standard-configuration',
  templateUrl: './last-mile-standard-configuration.component.html',
  styleUrls: ['./last-mile-standard-configuration.component.scss'],
})
export class LastMileStandardConfigurationComponent
  implements OnInit, OnDestroy
{
  // Public variables -------------------------------------------------------
  public lastMile: StoreLastMile | null;
  public lastMileForm = new FormGroup({});
  public fields: {
    name: string;
    description: string;
    type: string;
    value: any;
  }[] = [];
  public formReady = false;
  public storeId: number;

  // Private variables -------------------------------------------------------
  private _ngUnsubscribe$: Subject<any> = new Subject();

  constructor(
    private _storeService: StoreService,
    private _lastMileService: LastMileService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  public ngOnInit(): void {
      this.getStoreLastMile();
      this.watchValueChanges();
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
    this._ngUnsubscribe$.complete();
  }

  public get disabledSaveButton(): boolean {
    return this.lastMileForm.invalid || this.lastMileForm.pristine;
  }

  //Public methods ------------------------------------------------------
  public getControl(key: string) {
    return (this.lastMileForm.controls as any)[key];
  }

  public getInputType(key: string) {
    return this.lastMile?.getTypeForSchemaType(key) || 'text';
  }

  public onCancel(): void {
    this._router.navigate([
      this._router.url.substring(0, this._router.url.lastIndexOf('/') + 1),
    ]);
  }

  public fillForm(storeLastMile: StoreLastMile): void {
    this.fields = storeLastMile.schemaStore.map(
      ({ name, description, type }) => ({
        name,
        description,
        type: type === 'string' ? 'text' : type,
        value: storeLastMile.configuration.find((c) => c.name === name)?.value,
      })
    );

    this.fields.forEach(({ name, type }) => {
      this.lastMileForm.addControl(
        name,
        new FormControl(
          storeLastMile.configuration.find((c) => c.name === name)?.value || '',
          [Validators.required]
        )
      );
    });

    this.lastMileForm.markAsPristine();
    this.formReady = true;
  }

  public onSubmit(): void {
    if (this.lastMileForm.invalid) {
      return;
    }

    if (!this.lastMile) {
      return;
    }

    this.lastMile.configuration = this.fields.map((field) => ({
      name: field.name,
      value: this.lastMileForm.get(field.name)?.value,
      type: field.type,
      description: field.description,
    }));

    this._lastMileService
      .saveStoreLastMileConfiguration(this.storeId, this.lastMile)
      .pipe(
        loader(StoreComponent.LOADER_ID),
        toaster({
          sucessMsg: 'lastMile.lastMileUpdatedSuccessfully',
          errorMsg: 'basicError',
        }),
        finalize(() => {
          this.lastMileForm.markAsPristine();
        })
      ).subscribe({
        error: () => {
          if (this.lastMile) {
            this.lastMile.configuration = this.fields;
          }
        },
      });
  }

  private getStoreLastMile(): void {
    const lastMileName = this._activatedRoute.snapshot.params.lastMileName;

    this._storeService
      .getCurrentStore$()
      .pipe(
        takeUntil(this._ngUnsubscribe$),
        switchMap((store) => {
          if (!store.id) {
            return of(null);
          }
          this.storeId = store.id;
          return this._lastMileService
            .getStoreLastMile(store.id, lastMileName)
            .pipe(loader(StoreComponent.LOADER_ID));
        })
      )
      .subscribe({
        next: (lastMile) => {
          this.lastMile = lastMile;
          if (lastMile) {
            this.fillForm(lastMile);
          }
        },
        error: () => {
          this._router.navigate(['/404']);
        },
      });
  }

  private watchValueChanges() {
    this.lastMileForm.valueChanges
      .subscribe((values) => {
        const areAllEqual = Object.entries(values).every(([key, value]) => {
          const field = this.fields.find((f) => f.name === key);
          if (!field) {
            return true;
          }

          return field.value === value;
        })

        if (areAllEqual) {
          this.lastMileForm.markAsPristine();
        }
      });
  }
}

