import { Injectable } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Store } from "../../models/store/store";
import { IdName } from "@shared/models/classes/id-name";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class StoreInfoFormService {
  private store: Store = new Store();
  isNew?: boolean;

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
    const regionId = this.storeInformationForm.get('region')?.value;
    const provinceId = this.storeInformationForm.get('province')?.value;
    const cityId = this.storeInformationForm.get('city')?.value;
    const currencyId = this.storeInformationForm.get('currency')?.value;

    store.id = this.storeInformationForm.get('uid')?.value;
    store.storecode = this.storeInformationForm.get('storecode')?.value;
    store.name = this.storeInformationForm.get('name')?.value;
    store.region = IdName.buildOrUndefined({ id: regionId });
    store.address = this.storeInformationForm.get('streetAddress')?.value;
    store.city = IdName.buildOrUndefined({ id: cityId });
    store.province = IdName.buildOrUndefined({ id: provinceId });
    store.postalCode = this.storeInformationForm
      .get('postalCode')
      ?.value?.toString();
    store.latitude = this.storeInformationForm.get('latitude')?.value;
    store.longitude = this.storeInformationForm.get('longitude')?.value;
    store.currency = IdName.buildOrUndefined({ id: currencyId });
  }
}
