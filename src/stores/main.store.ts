import React, { createContext } from 'react';
import { types, Instance } from 'mobx-state-tree';

import { Product } from '../types/types';
import { data } from '../data/data';

const dataModel = types.model('dataEl', {
   id: types.number,
   img: types.string,
   name: types.string,
   price: types.number,
   selected: types.boolean,
   amount: types.number,
   sum: types.number,
});

export const mainStore = types
   .model('mainStore', {
      isReceived: types.optional(types.boolean, false), // Состояние окна об успешном заказе
      data: types.optional(types.array(dataModel), data), // Данные о товарах
   })
   .views(self => ({
      // Высчитываем количество выбранных товаров
      get countSelectedComputed() {
         return self.data.reduce((count, item) => (item.selected ? (count += 1) : count), 0);
      },

      // Проверяем, есть ли выбранные товары
      get hasSelectedComputed() {
         return this.countSelectedComputed > 0;
      },

      // Высчитываем сумму выбранных товаров
      get sumComputed() {
         return self.data.reduce((sum, item) => (item.selected ? (sum += item.sum) : sum), 0);
      },
   }))
   .actions(self => ({
      // Очистить корзину
      clearCart(): void {
         self.data.forEach((dataEl: Product): void => {
            dataEl.amount = 0;
            dataEl.selected = false;
            dataEl.sum = 0;
         });
         self.isReceived = false;
      },

      // Открыть / Закрыть окно об успешном заказе
      setIsReceived(newValue: boolean): void {
         self.isReceived = newValue;
      },

      // Добавить товар в заказ
      selectProduct(product: Product): void {
         if (!product.selected) {
            self.data.forEach((dataEl: Product): void => {
               if (dataEl.id === product.id) {
                  dataEl.selected = true;
                  dataEl.amount = 1;
                  dataEl.sum = dataEl.price;
               }
            });
         }
      },

      // Удалить товар из заказа или корзины
      deleteProduct(product: Product): void {
         self.data.forEach((dataEl: Product): void => {
            if (dataEl.id === product.id) {
               dataEl.selected = false;
               dataEl.amount = 0;
            }
         });
      },

      // Уменьшить количество товара в заказе
      minusAmount(product: Product): void {
         if (product.amount !== 1) {
            self.data.forEach((dataEl: Product): void => {
               if (dataEl.id === product.id) {
                  dataEl.sum -= dataEl.price;
                  dataEl.amount -= 1;
               }
            });
         } else {
            this.deleteProduct(product);
         }
      },

      // Увеличить количество товара в заказе
      plusAmount(product: Product): void {
         self.data.forEach((dataEl: Product): void => {
            if (dataEl.id === product.id) {
               dataEl.sum += dataEl.price;
               dataEl.amount += 1;
            }
         });
      },
   }));

export const RootStoreContext = createContext<null | Instance<typeof mainStore>>(null);
export const StoreProvider = RootStoreContext.Provider;

export function useStore() {
   const store = React.useContext(RootStoreContext);
   if (store === null) {
      throw new Error('Store cannot be null, please add a context provider');
   }
   return store;
}
