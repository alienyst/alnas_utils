================================================================
Google Map Autocomplete Widget
================================================================

The Google Map Autocomplete Widget app simplifies address input by integrating Google Maps API, providing real-time suggestions, automatic location display on a map, and accurate address filling for an efficient user experience.

In General Settings, Allow Geolocation and Then Change API to 'Google Place Map' and Enter API Key.

How to use widget:
<!-- widget_key: odoo_model_field -->
add this widget in the form
`<widget name="gmaps_address_autocomplete" options="{'fields': {'widget_key': 'odoo_model_field'}}"/>`
example
`<widget name="gmaps_address_autocomplete" options="{'fields': {'latitude': 'partner_latitude', 'longitude': 'partner_longitude'}}"/>`

Exist Widget Key in fields options:
latitude
longitude
name
full_address
address
address2
phone
country
state
city
zip
website
description