import EmbedCreateWidgetButton from '~/components/embed/EmbedCreateWidgetButton';
import EmbedUserInfo from '~/components/embed/EmbedUserInfo';
import SocialMediaConnect from '~/components/SocialMediaConnect';

import {
  apiGetUserMinById,
  apiGetSocialListById,
} from '~/util/api/api';

export default {
  components: {
    EmbedCreateWidgetButton,
    EmbedUserInfo,
    SocialMediaConnect,
  },
  asyncData({
    route,
    params,
    error,
  }) {
    let amount = 8;
    try {
      const parse = parseInt(params.amount, 10);
      if (parse && !Number.isNaN(parse)) amount = parse;
    } catch (e) {
      // no op;
    }

    let amountInUSD;
    if (/in-embed-id-button(-amount)?/.test(route.name)) {
      amountInUSD = amount;
      const USD_TO_LIKE = 0.0082625; // TODO: Real time price
      amount = (amountInUSD / USD_TO_LIKE).toFixed(2);
    }

    const { id } = params;
    return Promise.all([
      apiGetUserMinById(id),
      apiGetSocialListById(id).catch(() => {}),
    ]).then((res) => {
      const {
        displayName,
        avatar,
      } = res[0].data;
      return {
        id,
        displayName,
        avatar,
        amount,
        amountInUSD,
        platforms: res[1].data,
      };
    }).catch((err) => {
      console.error(err);
      error({ statusCode: 404, message: '' });
    });
  },
  computed: {
    getUserPath() {
      const amount = this.amount ? `/${this.amount}` : '';
      const referrer = this.urlReferrer ? `/?referrer=${this.urlReferrer}` : '';
      return `/${this.id}${amount}${referrer}`;
    },
    urlReferrer() {
      const { query } = this.$route;
      return query.referrer || '';
    },
    getReferralLink() {
      const referrer = this.urlReferrer ? `/?referrer=${this.urlReferrer}` : '';
      return `https://like.co/ref/${this.id}${referrer}`;
    },
  },
};
