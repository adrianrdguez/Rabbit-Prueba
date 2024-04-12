import { Injectable } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Store } from "../../models/store/store";
import { IdName } from "@shared/models/classes/id-name";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { ListOption } from "@shared/models/interfaces/list-option";

@Injectable({ providedIn: 'root' })
export class StoreInfoFormService {
  private store: Store = new Store();
  isNew?: boolean;

  regionsListOptions: ListOption[] = [];
  provincesListOptions: ListOption[] = [];
  citiesListOptions: ListOption[] = [];

  public storeInformationForm: FormGroup = new FormGroup({
    uid: new FormControl({ value: this.store.id, disabled: true }),
    storecode: new FormControl('', Validators.required),
    name: new FormControl(''),
    region: new FormControl(this.store.region?.id),
    address: new FormControl(''),
    city: new FormControl(this.store.city?.id),
    province: new FormControl(this.store.province?.id),
    postalCode: new FormControl(),
    longitude: new FormControl(),
    latitude: new FormControl(),
    currency: new FormControl(this.store.currency?.id),
  });

  public setStore(store: Store, isNew = false) {
    this.store = store;
    this.isNew = isNew;
    if (!this.isNew) {
      this.fillStoreInformationForm(store);
    }
  }

  public getFormsAsStore(): Store {
    const newStore = this.store;
    this.handleSubmitionForm(newStore);
    return newStore;
  }

  public get isAllValid$(): Observable<boolean> {
    return this.storeInformationForm.valueChanges.pipe(
      map(() => this.storeInformationForm.valid)
    );
  }

  public get isAllValid(): boolean {
    return this.storeInformationForm.valid;
  }

  // Private methods --------------------------------------------------

  private fillStoreInformationForm(store: Store) {
    this.storeInformationForm.patchValue({
      uid: store.id,
      storecode: store.storecode,
      name: store.name,
      region: store.region?.id,
      address: store.address,
      city: store.city?.id,
      province: store.province?.id,
      postalCode: store.postalCode,
      longitude: store.longitude,
      latitude: store.latitude,
      currency: store.currency?.id,
    });

    this.storeInformationForm.markAsPristine();
  }



  private handleSubmitionForm(store: Store) {
    const region = this.regionsListOptions.find(
      (region) => region.key === this.storeInformationForm.get('region')?.value
    ) ?? {} as any;

    const province  = this.provincesListOptions.find
    ((province) => province.key === this.storeInformationForm.get('province')?.value
    ) ?? {} as any;

    const city = this.citiesListOptions.find(
      (city) => city.key === this.storeInformationForm.get('city')?.value
    )  ?? {} as any;

    const currencyId = this.storeInformationForm.get('currency')?.value;

    store.id = this.storeInformationForm.get('uid')?.value;
    store.storecode = this.storeInformationForm.get('storecode')?.value;
    store.name = this.storeInformationForm.get('name')?.value;
    store.region = IdName.buildOrUndefined({ id: region.key, name: region.value });
    store.address = this.storeInformationForm.get('address')?.value;
    store.city = IdName.buildOrUndefined({ id: city.key, name: city.value });
    store.province = IdName.buildOrUndefined({ id: province.key, name: province.value });
    store.postalCode = this.storeInformationForm
      .get('postalCode')
      ?.value?.toString();
    store.latitude = this.storeInformationForm.get('latitude')?.value;
    store.longitude = this.storeInformationForm.get('longitude')?.value;
    store.currency = IdName.buildOrUndefined({ id: currencyId });
  }
}
