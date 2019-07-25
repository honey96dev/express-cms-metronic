import {server, dbTblName} from './config';
import dbConn from './dbConn';
import {sprintf} from 'sprintf-js';

const generateTrovitXml = (resolve, reject) => {
    if (typeof resolve != 'function') {
        resolve = console.log;
    }
    if (typeof reject != 'function') {
        reject = console.error;
    }

    let sql = sprintf("SELECT P.*, H.fileNames `photos` FROM `%s` P LEFT JOIN `%s` H ON H.property_id = P.id WHERE P.freeListingTrovit = '1';", dbTblName.properties, dbTblName.property_photos);
    dbConn.query(sql, null, (error, result, fields) => {
        if (error) {
            reject(error);
            return;
        }

        let xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml += '<trovit>';
        for (let row of result) {
            xml += '<ad>';
            xml += sprintf("<id><![CDATA[%s]]></id>", row['id']);
            xml += sprintf("<url><![CDATA[%s]]></url>", sprintf("%spropiedad/view/%s"), server.wwwBaseUrl, row['id']);
            xml += sprintf("<title><![CDATA[%s]]></title>", row['name']);
            xml += sprintf("<type><![CDATA[%s]]></type>", row['type']);
            xml += sprintf("<content><![CDATA[%s]]></content>", row['description']);
            xml += sprintf('<price><![CDATA[%s]]></price>', row['price']);
            xml += sprintf('<price period="monthly"><![CDATA[%s]]></price>', row['monthlyPrice']);
            xml += sprintf('<property_type><![CDATA[%s]]></property_type>', row['type']);
            xml += sprintf('<rooms><![CDATA[%d]]></rooms>', row['rooms']);
            xml += sprintf('<bathrooms><![CDATA[%d]]></bathrooms>', row['baths']);
            xml += sprintf('<address><![CDATA[%s]]></address>', row['address']);
            xml += sprintf('<date><![CDATA[%s]]></date>', row['availableForm']);
            let photos = row['photos'];
            if (photos != '**') {
                xml += '<pictures>';
                photos = photos.split('*');
                for (let photo of photos) {
                    if (photo.length > 0) {
                        xml += '<picture>';
                        xml += sprintf('<picture_url><![CDATA[%s]]></picture_url>', sprintf("%suploads/photo/%s", server.propietariosBaseUrl, photo));
                        xml += '</picture>';
                    }
                }
                xml += '</pictures>';
            }

            xml += '</ad>';
            xml += '</trovit>';
        }

        resolve(xml);
    });
};


module.exports = {
    generateTrovitXml,
}
