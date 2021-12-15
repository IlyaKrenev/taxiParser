let answer,
    myPos,
    aUsed = 0,
    bUsed = 0,
    buttons = document.querySelectorAll('.taxi'),
    checkButton = document.querySelector('#check'),
    map = document.querySelector('#map'),
    coordA, coordB,
    prices = document.querySelector('#prices'),
    addButton = document.querySelector('#Add'),
    trackButton = document.querySelector('.track'),
    trackPopup = document.querySelector('.trackPopup');

navigator.serviceWorker.customFlag = 0;

ymaps.ready(init);

function init() {
    let panel = document.querySelector('.ymaps-2-1-79-control-popup-parent'),
        inputs = document.querySelectorAll('.ymaps-2-1-79-route-panel-input__input'),
        clears = document.querySelectorAll('.ymaps-2-1-79-route-panel-input__clear'),
        adress = document.querySelector('#adress'),
        control = myMapExport.controls.get('routePanelControl');
    adress.appendChild(panel);

    let location = ymaps.geolocation.get();
    location.then(
        function (result) {
            myPos = result.geoObjects.position;
            myMapExport.setCenter(myPos);
        },
        function (err) {
            console.log('Ошибка: ' + err)
        }
    )

    control.routePanel.getRouteAsync().then(function (route) {
        route.model.events.add('requestsuccess', function () {
            let activeRoute = route.getActiveRoute();
            if (activeRoute) {
                addButton.classList.add('hide');
                checkButton.classList.remove('hide');
                if (!coordA) {
                    ymaps.geocode(control.routePanel.state.get("from"), {
                        results: 1
                    }).then(function (res) {
                        coordA = res.geoObjects.get(0).geometry.getCoordinates();
                    })
                }

                if (!coordB) {
                    ymaps.geocode(control.routePanel.state.get("to"), {
                        results: 1
                    }).then(function (res) {
                        coordB = res.geoObjects.get(0).geometry.getCoordinates();
                    })
                }
            }
        })
    });

    for (const clear of clears) {
        clear.addEventListener('pointerdown', () => {
            addButton.classList.remove('hide');
            checkButton.classList.add('hide');
            prices.classList.add('hide');
            trackButton.classList.add('hide');
        })
    }

    clears[0].addEventListener('pointerdown', () => {
        coordA = null;
    });

    clears[1].addEventListener('pointerdown', () => {
        coordB = null;
    });

    addButton.addEventListener('pointerdown', () => {
        let rekt = document.querySelector('#point').getBoundingClientRect();
        let projection = myMapExport.options.get('projection');

        if (inputs[0].value == '') {
            let coords = projection.fromGlobalPixels(
                myMapExport.converter.pageToGlobal([rekt.x + rekt.width / 2, rekt.y + rekt.height]), myMapExport.getZoom()
            );
            coordA = coords;

            control.routePanel.state.set({
                from: coordA,
            });

        } else if (inputs[1].value == '') {
            let coords = projection.fromGlobalPixels(
                myMapExport.converter.pageToGlobal([rekt.x + rekt.width / 2, rekt.y + rekt.height]), myMapExport.getZoom()
            );
            coordB = coords;
            control.routePanel.state.set({
                to: coordB,
            });
        }
    });

    checkButton.addEventListener('click', () => {
        if (coordA && coordB) {
            cityMobilBody = {"method":"getprice","ver":"4.59.0","phone_os":"android","os_version":"web mobile-web","locale":"ru","latitude":coordA[0], "longitude":coordA[1],"del_latitude":coordB[0],"del_longitude":coordB[1],"options":[],"payment_type":["cash"],"tariff_group":[2,4,13,7,5],"source":"O","hurry":1};
            fetchQuery('https://c-api.city-mobil.ru/getprice', 'POST', cityMobilBody)
                .then(res => {
                    buttons[1].innerText = res.prices[0].price;
                });
            
            fetchQuery(`https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=${apiKeys.clid}&apikey=${apiKeys.apikey}&rll=${coordA[1]},${coordA[0]}~${coordB[1]},${coordB[0]}&class=econom`)
                .then(res => {
                    buttons[0].innerText = res.options[0].price;
                })

            fetchQuery(`https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=${apiKeys.clid}&apikey=${apiKeys.apikey}&rll=${coordA[1]},${coordA[0]}~${coordB[1]},${coordB[0]}&class=uberx`)
                .then(res => {
                    buttons[2].innerText = res.options[0].price;
                })

            setTimeout(() => {
                checkButton.classList.add('hide');
                prices.classList.remove('hide');
                trackButton.classList.remove('hide');
            }, 500);
        }
    })
    let inputRect = document.querySelector('.ymaps-2-1-79-control-popup').getBoundingClientRect();
    checkButton.style.width = addButton.style.width = inputRect.width + 'px';
    trackButton.style.width = addButton.style.width = inputRect.width + 'px';
}

buttons[0].addEventListener('click', () => {
    document.location.href = `https://3.redirect.appmetrica.yandex.com/route?start-lat=${coordA[0]}&start-lon=${coordA[1]}&end-lat=${coordB[0]}&end-lon=${coordB[1]}&ref=yoursiteru&appmetrica_tracking_id=1178268795219780156`;
})
buttons[1].addEventListener('click', () => {
    document.location.href = "https://l.city-mobil.ru/c/b16r04";
})
buttons[2].addEventListener('click', () => {
    document.location.href = `https://2171938.redirect.appmetrica.yandex.com/route?start-lat=${coordA[0]}&start-lon=${coordA[1]}&end-lat=${coordB[0]}&end-lon=${coordB[1]}&ref=yoursiteru&appmetrica_tracking_id=27377185706773369`;
})

trackButton.addEventListener('click', () => {
    trackPopup.classList.remove('hide');
    blurBackground('add');
});

document.querySelector('.trackCancel').addEventListener('click', () => {
    trackPopup.classList.add('hide');
    blurBackground('remove');
})

document.querySelector('.trackStart').addEventListener('click', () => {
    if (navigator.serviceWorker.customFlag == 1){
        alert("Уведомления уже активны. Дождитесь завершения процесса или обновите страницу.");
        return;
    }
    const duration = document.querySelector('.trackDuration select').value;
    const steps = document.querySelector('.trackSteps select').value;
    const priceMax = +document.querySelector('.trackPrice input').value;
    const cbPrice = document.querySelector('.trackBool input').checked;
    let currentTime = new Date().getTime();
    navigator.serviceWorker.register('sw.js');
    trackPopup.classList.add('hide');
    blurBackground('remove');
    Notification.requestPermission().then(function(result) {
    if (result === 'granted') {
    navigator.serviceWorker.ready.then(function(registration) {
        navigator.serviceWorker.customFlag = 1;
        setInterval(() => {
            let newTime = new Date().getTime();
            let ytPrice = 0,
                uPrice = 0,
                cmPrice = 0;

            if (newTime > currentTime + duration*60000) return;

            (async function(){
                cityMobilBody = {"method":"getprice","ver":"4.59.0","phone_os":"android","os_version":"web mobile-web","locale":"ru","latitude":coordA[0], "longitude":coordA[1],"del_latitude":coordB[0],"del_longitude":coordB[1],"options":[],"payment_type":["cash"],"tariff_group":[2,4,13,7,5],"source":"O","hurry":1};
                ytPrice = await fetchQuery(`https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=${apiKeys.clid}&apikey=${apiKeys.apikey}&rll=${coordA[1]},${coordA[0]}~${coordB[1]},${coordB[0]}&class=econom`);
                ytPrice = ytPrice.options[0].price;
                uPrice = await fetchQuery(`https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=${apiKeys.clid}&apikey=${apiKeys.apikey}&rll=${coordA[1]},${coordA[0]}~${coordB[1]},${coordB[0]}&class=uberx`);
                uPrice = uPrice.options[0].price;
                cmPrice = await fetchQuery('https://c-api.city-mobil.ru/getprice', 'POST', cityMobilBody);
                cmPrice = cmPrice.prices[0].price;

                if (!cbPrice){
                    await registration.showNotification(
                        'Yandex: ' + ytPrice + ' CityMobil: ' + cmPrice + ' Uber: ' + uPrice 
                    )
                }
                else if (ytPrice < priceMax || cmPrice < priceMax || uPrice < priceMax){
                    await registration.showNotification(
                        'Yandex: ' + ytPrice + ' CityMobil: ' + cmPrice + ' Uber: ' + uPrice 
                    )
                }
                
            })();
        }, steps * 60000)
    });
  }
});
navigator.serviceWorker.customFlag = 0;
})


function blurBackground(method){
    map.classList[method]('blurEffect');
    prices.classList[method]('blurEffect');
    checkButton.classList[method]('blurEffect');
    addButton.classList[method]('blurEffect');
    trackButton.classList[method]('blurEffect');
    document.querySelector('#adress').classList[method]('blurEffect');
}

async function fetchQuery(link, type = 'GET', body = {}, outputType = 'json'){
    let response, data;
    switch (type){
        case 'GET':
            response = await fetch(link);
            break;
        default:
            response = await fetch(link, {
                method: type,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({...body}),
            });
            break;
    }
    if (response.ok) {
        switch(outputType){
            case 'json':
                data = await response.json();
                break;
            case 'text':
                data = await response.text();
                break;
            default:
                console.log('Incorrect output type.');
                return {};
        }
        return data
    } else {
        console.log('Error in response', response.status);
    }
}