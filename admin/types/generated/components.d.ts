import type { Schema, Struct } from '@strapi/strapi';

export interface AdvantagesAdvantages extends Struct.ComponentSchema {
  collectionName: 'components_advantages_advantages';
  info: {
    displayName: 'advantages';
    icon: 'thumbUp';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AdvantagesPreimushhestva extends Struct.ComponentSchema {
  collectionName: 'components_advantages_preimushhestva';
  info: {
    displayName: '\u041F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u0430';
    icon: 'thumbUp';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CardsBanksKartochkiBankov extends Struct.ComponentSchema {
  collectionName: 'components_cards_banks_kartochki_bankov';
  info: {
    displayName: '\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u0431\u0430\u043D\u043A\u043E\u0432';
    icon: 'dashboard';
  };
  attributes: {
    bank_name: Schema.Attribute.String;
    die: Schema.Attribute.String & Schema.Attribute.Required;
    for: Schema.Attribute.String;
    full_price: Schema.Attribute.String;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Schema.Attribute.Required;
    month_pay: Schema.Attribute.String;
    sum: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'advantages.advantages': AdvantagesAdvantages;
      'advantages.preimushhestva': AdvantagesPreimushhestva;
      'cards-banks.kartochki-bankov': CardsBanksKartochkiBankov;
    }
  }
}
