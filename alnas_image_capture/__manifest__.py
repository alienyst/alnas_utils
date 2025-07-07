# -*- coding: utf-8 -*-
{
    'name': "Webcam Image Capture",

    'summary': "Add functionality in image field to take image from webcam",

    'description': """ 
        1. Move your cursor to the bottom of the box in the image field.
        2. Click on the camera icon.
        3. You can now take the desired photo using your webcam.
    """,

    'author': "Ali Ns",
    'website': "https://www.github.com/alienyst",

    'category': 'Other',
    'version': '18.0.0.0.1',

    'depends': ['web'],
    
    'license': 'LGPL-3',
    
    'installable': True,
    
    'assets': {
        'web.assets_backend': [
            'alnas_image_capture/static/src/**/**.scss',
            'alnas_image_capture/static/src/**/**.js',
            'alnas_image_capture/static/src/**/**.xml',
        ],
    },
    
}

