pc.extend(pc.fw, function () {
    var _createGfxResources = function () {
        var lightMat = new pc.scene.Material();
        lightMat.setProgramName("phong");
        lightMat.setParameter("material_ambient",   [0,0,0]);
        lightMat.setParameter("material_diffuse",   [0,0,0]);
        lightMat.setParameter("material_specular",  [0,0,0]);
        lightMat.setParameter("material_shininess", 1);
        lightMat.setParameter("material_emissive",  [1,1,0]);
        lightMat.setParameter("material_opacity",   1);

        var sphereGeom = pc.scene.procedural.createSphere({material: lightMat});
        
        var sphereMesh = new pc.scene.MeshNode();
        sphereMesh.setGeometry(sphereGeom);
        
        return sphereMesh;
    };

    /**
     * @name pc.fw.PointLightComponentSystem
     * @constructor Create a new PointLightComponentSystem
     * @class A Light Component is used to dynamically light the scene.
     * @param {Object} context
     * @extends pc.fw.ComponentSystem
     */
    var PointLightComponentSystem = function (context) {
        this.context = context;
        context.systems.add("pointlight", this);

        this.renderable = _createGfxResources();

        // Handle changes to the 'attenuationEnd' value
        this.bind("set_attenuationEnd", this.onSetAttenuationEnd.bind(this));
        // Handle changes to the 'castShadows' value
        this.bind("set_castShadows", this.onSetCastShadows.bind(this));
        // Handle changes to the 'color' value
        this.bind("set_color", this.onSetColor.bind(this));
        // Handle changes to the 'enable' value
        this.bind("set_enable", this.onSetEnable.bind(this));
        // Handle changes to the 'intensity' value
        this.bind("set_intensity", this.onSetIntensity.bind(this));
        // Handle changes to the 'light' value
        this.bind("set_light", this.onSetLight.bind(this));
    };
        
    PointLightComponentSystem = PointLightComponentSystem.extendsFrom(pc.fw.ComponentSystem);

    PointLightComponentSystem.prototype.createComponent = function (entity, data) {
        var componentData = new pc.fw.PointLightComponentData();

        var light = new pc.scene.LightNode();
        light.setType(pc.scene.LightType.POINT);

        data = data || {};
        data.light = light;

        var attribs = ['light', 'enable', 'color', 'intensity', 'castShadows', 'attenuationEnd'];
        this.initialiseComponent(entity, componentData, data, attribs);

        return componentData;
    };
    
    PointLightComponentSystem.prototype.deleteComponent = function (entity) {
        var componentData = this.getComponentData(entity);
        entity.removeChild(componentData.light);
        componentData.light.setEnabled(false);
        delete componentData.light;

        this.removeComponent(entity);
    };

    PointLightComponentSystem.prototype.toolsRender = function (fn) {
        var components = this.getComponents();
        for (var id in components) {
            if (components.hasOwnProperty(id)) {
                var entity = components[id].entity;
                var componentData = components[id].component;

                var transform = entity.getWorldTransform();

                this.renderable.setLocalTransform(transform);
                this.renderable.syncHierarchy();
                this.renderable.dispatch();
            }
        }
    };

    PointLightComponentSystem.prototype.onSetAttenuationEnd = function (entity, name, oldValue, newValue) {
        if (newValue) {
            var componentData = this.getComponentData(entity);
            componentData.light.setAttenuationEnd(newValue);
        }
    };

    PointLightComponentSystem.prototype.onSetCastShadows = function (entity, name, oldValue, newValue) {
        if (newValue !== undefined) {
            var componentData = this.getComponentData(entity);
            componentData.light.setCastShadows(newValue);
        }
    };
    
    PointLightComponentSystem.prototype.onSetColor = function (entity, name, oldValue, newValue) {
        if (newValue) {
            var componentData = this.getComponentData(entity);
            var rgb = parseInt(newValue);
            rgb = pc.math.intToBytes24(rgb);
            var color = [
                rgb[0] / 255,
                rgb[1] / 255,
                rgb[2] / 255
            ];
            componentData.light.setColor(color);
        }
    };

    PointLightComponentSystem.prototype.onSetEnable = function (entity, name, oldValue, newValue) {
        if (newValue !== undefined) {
            var componentData = this.getComponentData(entity);
            componentData.light.setEnabled(newValue);
        }
    };

    PointLightComponentSystem.prototype.onSetIntensity = function (entity, name, oldValue, newValue) {
        if (newValue !== undefined) {
            var componentData = this.getComponentData(entity);
            componentData.light.setIntensity(newValue);
        }
    };

    PointLightComponentSystem.prototype.onSetLight = function (entity, name, oldValue, newValue) {
        if (oldValue) {
            entity.removeChild(oldValue);
            this.context.scene.removeLight(oldValue);
        }
        if (newValue) {
            entity.addChild(newValue);
            this.context.scene.addLight(newValue);
        }
    };
    
    return {
        PointLightComponentSystem: PointLightComponentSystem
    }; 
}());
