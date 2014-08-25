require.config({
    baseUrl: 'js'
});

require(['jquery'], function (jquery, pricePoint) {
    console.log(jquery, pricePoint);
});