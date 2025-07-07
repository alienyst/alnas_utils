/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";
import { ImageField } from '@web/views/fields/image/image_field';

import { WebcamDialog } from "../components/webcam_dialog";


// add openWebcam to ImageField
patch(ImageField.prototype,{
    
    setup(){
        super.setup();
        this.dialogService = useService('dialog');
    },

    openCamera(ev){
        ev.stopPropagation()
        this.dialogService.add(WebcamDialog, {
            record: this.props.record,
            field: this.props.name,
            title: 'Image Capture ' + (this.props.record.data.display_name || ''),
        });
    }
})
