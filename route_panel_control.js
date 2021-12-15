let myMapExport;
ymaps.ready(function () {

    var myMap = new ymaps.Map('map', {
        center: [59.933390, 30.328749],
        zoom: 16,
        controls: []
    }, {
        searchControlProvider: 'browser#search'
    });

    myMap.controls.add('routePanelControl', {
        maxWidth: '300px',
    });

    var control = myMap.controls.get('routePanelControl');

    myMap.controls.add('zoomControl', {
        size: "small",
        position: {
            top: 220,
            left: 10
        },
        zoomDuration: 300
    });

    var searchControl = new ymaps.control.SearchControl({
        options: {
            provider: 'yandex#search',
            noPopup: true,
            size: 'large',
            geoObjectStandardPreset: 'islands#blackCircleIcon'
        }
    });
    myMap.controls.add(searchControl);

    control.routePanel.state.set({
        type: 'masstransit',
        fromEnabled: true,
        toEnabled: true,
    });

    control.routePanel.options.set({
        allowSwitch: true,
        reverseGeocoding: true,
        types: {
            taxi: true
        }
    });

    control.routePanel.getRouteAsync().then(function (route) {

        route.model.setParams({
            results: 3
        }, true);

        route.options.set({
            routeStrokeColor: "000000"
        });
    });
    myMapExport = myMap;
});
