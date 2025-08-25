{
    "name": "Google Map Autocomplete Widget",
    "summary": "The Google Map Autocomplete Widget app simplifies address input by integrating Google Maps API, providing real-time suggestions, automatic location display on a map, and accurate address filling for an efficient user experience.",
    "category": "Services",
    "version": "18.0.1.0.0",
    "author": "Ali Ns",
    "website": "https://www.github.com/alienyst",
    "depends": ['base_geolocalize', 'contacts'],
    "data":[
        'views/res_partner_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'alnas_gmaps_autocomplete/static/src/**/**.scss', 
            'alnas_gmaps_autocomplete/static/src/**/**.js',  
            'alnas_gmaps_autocomplete/static/src/**/**.xml',   
        ],
    },
    "license": "LGPL-3",
    "installable": True,
}