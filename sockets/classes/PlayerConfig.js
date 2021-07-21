class PlayerConfig {
  constructor(settings) {
    this.xVector = 0;
    this.yVector = 0;
    this.speed = settings.defauleSpeed;
    this.zoom = settings.defaultZoom;
  }
}

module.exports = PlayerConfig;
