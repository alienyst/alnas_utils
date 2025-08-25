from odoo import api, models


class GeoCoder(models.AbstractModel):
    _inherit = "base.geocoder"
    

    @api.model
    def google_map_api_key(self):
        apikey = self.env['ir.config_parameter'].sudo().get_param('base_geolocalize.google_map_api_key')
        return apikey