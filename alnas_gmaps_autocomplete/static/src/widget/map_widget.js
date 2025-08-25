/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { Component, useRef, onMounted, onWillStart, useState, onWillUpdateProps, onWillDestroy } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardWidgetProps } from "@web/views/widgets/standard_widget_props";


export class AddressAutocompleteField extends Component {
    
    static template = 'alnas_gmaps_autocomplete.MapWidget';
    static props = {
        ...standardWidgetProps,
        fields: {
            latitude: { type: String, optional: false },
            longitude: { type: String, optional: false },
            name: { type: String, optional: true },
            full_address:  { type: String, optional: true },
            address:  { type: String, optional: true },
            address2:  { type: String, optional: true },
            phone:  { type: String, optional: true },
            country:  { type: String, optional: true },
            state:  { type: String, optional: true },
            city:  { type: String, optional: true },
            zip:  { type: String, optional: true },
            website:  { type: String, optional: true },
            description:  { type: String, optional: true },
        }
    };

    setup() {
        super.setup();
        this.mapContainer = useRef('mapContainer');
        this.state = useState({ 
            apiKeyAvailable: true, 
            marker: false, 
            infoWindow: false,
            center: false,
            alreadyMark: false,
        });

        this.orm = this.env.model.orm;
        this.theFields = this.env.model.config.fields
        this.map = false
        
        onWillStart(async () => {
            try {
                const apiKey = await this.orm.call("base.geocoder", "google_map_api_key");
                const gMapsElement = document.createElement('script');
                gMapsElement.setAttribute('data-remove', 'gMaps');
                gMapsElement.innerHTML = `(g => {
                    var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
                    b = b[c] || (b[c] = {});
                    var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams();
                    u = () => h || (h = new Promise(async (f, n) => {
                        await (a = m.createElement("script"));
                        e.set("libraries", [...r] + "");
                        for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
                        e.set("callback", c + ".maps." + q);
                        a.src = "https://maps." + c + "apis.com/maps/api/js?" + e;
                        d[q] = f;
                        a.onerror = () => h = n(Error(p + " could not load."));
                        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
                        m.head.append(a);
                    }));
                    d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
                })({
                    key: "${apiKey}",
                    v: "weekly",
                    language: "id",
                });`;
                document.head.appendChild(gMapsElement);   
                this.state.apiKeyAvailable = Boolean(apiKey);
                await this.initLibrary();
            } catch (error) {
                console.log(error);
                this.state.apiKeyAvailable = Boolean(apiKey);
                return;              
            }
        });

        onMounted(() => {
            let before = this.state.center;
            this._getCenterData(this.props.record)
            if (before !== this.state.center){
                this.initMap();
            }
        });

        onWillUpdateProps(async (nextProps) => {
            this._getCenterData(nextProps.record)
            if(this.state.apiKeyAvailable){
                this._updateMapCenter();
            }
        });

        onWillDestroy(()=> {
            this.destroyComponent()
        })

    }

    async initLibrary() {
        // import marker and places library
        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
            google.maps.importLibrary("marker"),
            google.maps.importLibrary("places")
        ]);
    }

    initMap(){

        if(!this.state.apiKeyAvailable){
            return 
        }
        // define a map
        this.map = new google.maps.Map(this.mapContainer.el, {
            center: this.state.center,
            zoom: 13,
            mapId: '4504f8b37365c3d0',
            mapTypeControl: false,
        });
        
        // define autocomplete before map
        const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement();
        this.mapContainer.el.parentNode.insertBefore(placeAutocomplete, this.mapContainer.el);
        
        // define marker
        this.state.marker = new google.maps.marker.AdvancedMarkerElement({
            map: this.map,
            gmpClickable: true,
        });
        if (this.state.alreadyMark){
            this.state.marker.position = this.map.getCenter()
        }

        this.state.infoWindow = new google.maps.InfoWindow({});

        // autocomplete
        placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: [
                'displayName', 
                'formattedAddress', 
                'location', 
                'postalAddress', 
                'internationalPhoneNumber', 
                'addressComponents',
                'websiteURI',
                'editorialSummary',
            ] });
            
            // update form
            let data = await this._getMapFields(place)
            for (const field of Object.keys(this.props.fields)) {
                let theField = this.theFields[this.props.fields[field]]
                if (theField?.type === "many2one") {
                    await this.props.record.update({ [this.props.fields[field]]: [data[field]] });
                } else {
                    await this.props.record.update({ [this.props.fields[field]]: data[field] });
                }
            }

            if (place.viewport) {
                this.map.fitBounds(place.viewport);
            }
            else {
                this.map.setCenter(place.location);
                this.map.setZoom(17);
            }
            let content = '<div id="infowindow-content">' +
                '<span id="place-displayname" class="title">' + place.displayName + '</span><br />' +
                '<span id="place-address">' + place.formattedAddress + '</span>' +
                '</div>';
            this._updateInfoWindow(content, place.location);
            this.state.marker.position = place.location;
        });

        new google.maps.event.addListener(this.map, 'click', (ev) => {
            // fetch place can use geocoder
            this.state.marker.position = ev.latLng;
            this.props.record.update({
                [this.props.fields.latitude]: ev.latLng.lat(),
                [this.props.fields.longitude]: ev.latLng.lng(),
            })
        });

    }

    // Helper function to create an info window.
    _updateInfoWindow(content, center) {
        this.state.infoWindow.setContent(content);
        this.state.infoWindow.setPosition(center);
        this.state.infoWindow.open({
            map: this.map,
            anchor: this.state.marker,
            shouldFocus: false,
        });
    }

    _getCenterData(record){
        let data_lat = record.data[this.props.fields.latitude]
        let data_lng = record.data[this.props.fields.longitude]
        if (data_lat || data_lng) {
            this.state.center = { lat: data_lat, lng: data_lng }
            this.state.alreadyMark = true
        } else {
            this.state.center = { lat: 40.749933, lng: -73.98633 } //default center
            this.state.alreadyMark = false
        }
    }

    _updateMapCenter() {
        const newCenter = new google.maps.LatLng(this.state.center);
        this.map.setCenter(newCenter);
    }

    // https://developers.google.com/maps/documentation/places/web-service/data-fields
    async _getMapFields(place) {
        let country_state_ids = await this._getCountryStateIds(place.postalAddress?.regionCode, 
            place.postalAddress?.administrativeArea); 
        let placeArray = place.postalAddress?.addressLines;
        let address = false
        if (Array.isArray(placeArray) && placeArray.length > 1) {
            address = placeArray.slice(0, -1).join(', ');
        }

        return {
            'name': place.displayName || false,
            'full_address': place.formattedAddress || false,
            'address': address,
            'address2': place.postalAddress?.sublocality || false,
            'latitude': place.Dg.location.lat,
            'longitude': place.Dg.location.lng,
            'phone': place.internationalPhoneNumber || false,
            'country': country_state_ids.country_id,
            'state': country_state_ids.state_id,
            'city': place.postalAddress?.locality || false,
            'zip': place.postalAddress?.postalCode || false,
            'website': place.websiteURI || false,
            'description': place.editorialSummary || false,
        }
    }

    async _getCountryStateIds(code, state_name){
        return await this.orm.call('res.partner', 'get_country_state_ids', [code, state_name]);
    }

    destroyComponent(){
        document.querySelectorAll('script[data-remove="gMaps"]').forEach(script => {
            script.remove();
        });
    }

}

export const addressAutocompleteField = {
    component: AddressAutocompleteField,
    extractProps: ({ options }) => ({
        fields: options.fields
    }),
}


registry.category("view_widgets").add("gmaps_address_autocomplete", addressAutocompleteField);



