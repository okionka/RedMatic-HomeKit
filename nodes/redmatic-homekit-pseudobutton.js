module.exports = function (RED) {
    class RedMaticHomeKitPseudobutton {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.bridgeConfig = RED.nodes.getNode(config.bridgeConfig);

            if (!this.bridgeConfig) {
                return;
            }

            const {hap, version} = this.bridgeConfig;

            this.name = config.name || ('Pseudobutton ' + this.id);

            const acc = this.bridgeConfig.accessory({id: this.id, name: this.name});

            const subtype = '0';
            this.valueOn = false;

            if (!acc.isConfigured) {
                acc.getService(hap.Service.AccessoryInformation)
                    .setCharacteristic(hap.Characteristic.Manufacturer, 'RedMatic')
                    .setCharacteristic(hap.Characteristic.Model, 'Pseudobutton')
                    .setCharacteristic(hap.Characteristic.SerialNumber, this.id)
                    .setCharacteristic(hap.Characteristic.FirmwareRevision, version);

                acc.addService(hap.Service.Switch, this.name, subtype);

                acc.isConfigured = true;
            }

            const setListener = (value, callback) => {
                this.log('set Switch 0 On ' + value);
                if (value) {
                    this.send({topic: config.topic, payload: value});
                    setTimeout(() => {
                        this.log('update Switch 0 On false');
                        acc.getService(subtype).updateCharacteristic(hap.Characteristic.On, false);
                    }, 250);
                }
                callback();
            };

            const getListener = callback => {
                this.log('get Switch 0 On false');
                callback(null, false);
            };

            acc.getService(subtype).getCharacteristic(hap.Characteristic.On).on('set', setListener);
            acc.getService(subtype).getCharacteristic(hap.Characteristic.On).on('get', getListener);

            this.on('close', () => {
                acc.getService(subtype).getCharacteristic(hap.Characteristic.On).removeListener('get', getListener);
                acc.getService(subtype).getCharacteristic(hap.Characteristic.On).removeListener('set', setListener);
            });
        }
    }

    RED.nodes.registerType('redmatic-homekit-pseudobutton', RedMaticHomeKitPseudobutton);
};
