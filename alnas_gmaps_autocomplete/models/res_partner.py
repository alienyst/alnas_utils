from odoo import models, fields, api


class ResPartner(models.Model):
    _inherit = 'res.partner'   

    map_address = fields.Char(string='Map Address')
    
    
    @api.model
    def get_country_state_ids(self, code, state_name):
        country_id = self.env['res.country'].search([('code', '=', code)], limit=1)
        state_id = self.env['res.country.state'].search([('name', '=', state_name), ('country_id', '=', country_id.id)], limit=1)
        return {
            'country_id': country_id.id if country_id else False,
            'state_id': state_id.id if state_id else False,
        }