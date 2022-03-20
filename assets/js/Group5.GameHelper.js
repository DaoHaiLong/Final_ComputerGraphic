var Group5 = window.Group5 || {};
Group5.GameHelper = Group5.GameHelper || {};

// Camera man helper 
Group5.GameHelper.CameraHelper = function(camera) {
    this.translation = 5;
    this.rotation = 0.035;
    this.origin = {
        position: {
            x: 0,
            y: 0,
            z: 0,
            mapX: 0,
            mapY: 0,
            mapZ: 0
        },
        x: 0,
        y: 0,
        z: 0
    };
    
    this.camera = camera;
};

// position state level
Group5.GameHelper.LevelHelper = function(start, end) {
    this.current = start || 1;
    this.next = this.current + 1;
    this.count = end || 3;
    this.isFinished = false;

    this.getNext = function() {
        if (this.next > this.count) {
            this.current = 1;
            this.next = 2;
            this.isFinished = true;
        } else {
            this.current = this.next;
            this.next++;
        }

        return this.current;
    }
};