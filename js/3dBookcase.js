var controls = new function() {
    // light
    this.posX = 50;
    this.posY = 50;
    this.posZ = 50;
};
var ThreeD = {
    init: function(canvasContainer) {
        this.Colors = {
            red: 0xf25346,
            white: 0xd8d0d1,
            brown: 0x59332e,
            pink: 0xF5986E,
            brownDark: 0x23190f,
            blue: 0x68c3c0
        }
        this.bookLocked = false;
        this.Event = {};
        this.books = [];
        this.container = canvasContainer || document.body;
        this.createScene();
        this.createLights();
        // this.initStats();
        // this.initGUI();
        this.draw();
        // OrbitControls
        this.orbitControls = new THREE.OrbitControls(this.camera);
        this.orbitControls.autoRotate = true;
        this.loop();
    },
    initStats: function(){
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 100;
        this.container.appendChild(this.stats.domElement);
    },
    initGUI: function() {
        var _this = this;
        var gui = new dat.GUI();
        gui.add(controls, "posX", 0, 500);
        gui.add(controls, "posY", 0, 500);
        gui.add(controls, "posZ", 0, 500);
    },
    draw: function() {
        var _this = this;
        var bookPics = [
            [],[],[],
            ['/3d-bookcase/img/bookfront2.jpg','/3d-bookcase/img/bookback2.jpg','/3d-bookcase/img/shuji2.jpg'],
            ['/3d-bookcase/img/bookfront3.jpg','/3d-bookcase/img/bookback3.jpg','/3d-bookcase/img/shuji3.jpg'],
            ['/3d-bookcase/img/bookfront4.jpg','/3d-bookcase/img/bookback4.jpg','/3d-bookcase/img/shuji4.jpg']
        ]
        var book_row1 = this.createBookRow(36,50,8,6);
        var book_row2 = this.createBookRow(36,50,8,10,bookPics);
        var bookcase = this.createBookcase(100,200,36);
        window.bookcase = bookcase;
        bookcase.position.z = -10;
        // bookcase.position.x = -50;
        // bookcase.rotation.y = 30*Math.PI/180;
        this.putBookRow(book_row1,bookcase,1);
        this.putBookRow(book_row2,bookcase,2);
        this.container.addEventListener("mousedown", (event) => {
            _this.handleAllRaycasters(event, (e, intersects)=>{
                var intersectsObj = intersects[0].object;
                for (var i = 0; i < _this.books.length; i++) {
                    _this.returnBook(_this.books[i]);
                }
                if(intersectsObj.name == "book"){
                    _this.showBook(intersectsObj.parent);
                }
            },(e, intersects)=>{
                for (var i = 0; i < _this.books.length; i++) {
                    _this.returnBook(_this.books[i]);
                }
            });
        }, false);
        this.scene.add(book_row1);
        this.scene.add(book_row2);
        this.scene.add(bookcase);
    },
    createBookRow: function(bookWidth, bookHeight, bookDepth, bookNum, bookPics=[[]]){
        var _this = this;
        var book_row = new THREE.Object3D();
        book_row.bookWidth = bookWidth;
        book_row.bookHeight = bookHeight;
        book_row.bookDepth = bookDepth;
        book_row.bookNum = bookNum;
        for (var i = 0; i < bookNum; i++) {
            (function(j){
                var book = _this.createBook(bookWidth, bookHeight, bookDepth, {x:(bookDepth+1)*j-(bookDepth+1)*bookNum/2+bookDepth/2,y:0,z:0}, bookPics[j]);
                _this.books.push(book);
                book_row.add(book);
            })(i);
        }
        book_row.position.z = bookWidth/2;
        return book_row;
    },
    putBookRow: function(book_row, bookcase, floorIndex){
        var bookHeight = book_row.bookHeight||50;
        var thickness = bookcase.thickness;
        var floorY = bookcase.floorsY[(floorIndex||1)];
        book_row.position.x -= ((bookcase.bookcaseWidth/2-(book_row.bookDepth+1)*book_row.bookNum/2-1)-bookcase.position.x);
        book_row.position.y = floorY+bookcase.thickness/2+bookcase.position.y;
        book_row.position.z += bookcase.position.z;
        book_row.rotation.x = bookcase.rotation.x;
        book_row.rotation.y = bookcase.rotation.y;
        book_row.rotation.z = bookcase.rotation.z;
    },
    createBookcase: function(width, height, depth, position={x:0,y:0,z:0}, floorNum=3){
        var bookcase = new THREE.Object3D();
        bookcase.bookcaseWidth = width;
        bookcase.bookcaseHeight = height;
        bookcase.bookcaseDepth = depth;
        bookcase.floorsY = [];
        bookcase.thickness = 4;
        depth += bookcase.thickness;
        var bookcase_horizontal = new THREE.BoxGeometry(width, bookcase.thickness, depth, 3, 3, 3);
        var bookcase_vertical = new THREE.BoxGeometry(bookcase.thickness, height+bookcase.thickness, depth, 3, 3, 3);
        var bookside_back = new THREE.BoxGeometry(width, height, bookcase.thickness, 3, 3, 3);
        var bookcase_mat = new THREE.MeshPhongMaterial( { 
            map: THREE.ImageUtils.loadTexture('/3d-bookcase/img/wood.jpg'),
        });
        var m_bookside_left = new THREE.Mesh(bookcase_vertical, bookcase_mat);
        m_bookside_left.castShadow = true;
        m_bookside_left.receiveShadow = true;
        m_bookside_left.position.x = -width/2-bookcase.thickness/2;
        m_bookside_left.name="m_bookside_left";
        var m_bookside_right = new THREE.Mesh(bookcase_vertical, bookcase_mat);
        m_bookside_right.castShadow = true;
        m_bookside_right.receiveShadow = true;
        m_bookside_right.position.x = width/2+bookcase.thickness/2;
        m_bookside_right.name="m_bookside_right";
        var m_bookside_back = new THREE.Mesh(bookside_back, bookcase_mat);
        m_bookside_back.castShadow = true;
        m_bookside_back.receiveShadow = true;
        m_bookside_back.position.z = -depth/2;
        m_bookside_back.name="m_bookside_back";
        bookcase.add(m_bookside_left);
        bookcase.add(m_bookside_right);
        bookcase.add(m_bookside_back);
        var floorGap = height/floorNum;
        for (var i = 0; i < floorNum+1; i++) {
            ((j)=>{
                var m_bookcase_horizontal = new THREE.Mesh(bookcase_horizontal, bookcase_mat);
                m_bookcase_horizontal.position.y = height/2 - floorGap*j;
                m_bookcase_horizontal.castShadow = true;
                m_bookcase_horizontal.receiveShadow = true;
                m_bookcase_horizontal.name="m_bookcase_horizontal";
                bookcase.add(m_bookcase_horizontal);
                bookcase.floorsY.push(m_bookcase_horizontal.position.y);
            })(i)
        }
        return bookcase;
    },
    createBook: function(width,height,depth,position,bookPic=[]){
        var material1 = new THREE.MeshPhongMaterial( { 
            map: THREE.ImageUtils.loadTexture('/3d-bookcase/img/bookside.jpg')});
        var material2 = new THREE.MeshPhongMaterial({ 
            map: THREE.ImageUtils.loadTexture(bookPic[2]||'/3d-bookcase/img/shuji.jpg')});
        var material3 = new THREE.MeshPhongMaterial({ 
            map: THREE.ImageUtils.loadTexture('/3d-bookcase/img/bookside2.jpg')});
        var material4 = new THREE.MeshPhongMaterial({ 
            map: THREE.ImageUtils.loadTexture('/3d-bookcase/img/bookside2.jpg')});
        var material5 = new THREE.MeshPhongMaterial({ 
            map: THREE.ImageUtils.loadTexture(bookPic[0]||'/3d-bookcase/img/bookfront1.jpg')});
        var material6 = new THREE.MeshPhongMaterial({ 
            map: THREE.ImageUtils.loadTexture(bookPic[1]||'/3d-bookcase/img/bookback1.jpg')});
        var materials = [material1, material2, material3, material4, material5, material6];
        var meshFaceMaterial = new THREE.MeshFaceMaterial( materials );

        var book_box = new THREE.Object3D();
        var book = new THREE.BoxGeometry(width, height, depth, 3, 3, 3);
        var book_mat = new THREE.MeshPhongMaterial({
            color: this.Colors.white,
        });
        // var m_book = new THREE.Mesh(book, book_mat);
        var m_book = new THREE.Mesh(book, meshFaceMaterial);
        m_book.position.x = 0;
        m_book.position.y = height/2;
        m_book.position.z = -width/2;
        m_book.rotation.y = Math.PI/2;
        m_book.castShadow = true;
        m_book.receiveShadow = true;
        m_book.name="book";
        book_box.add(m_book);
        book_box.position.x = position.x;
        book_box.position.y = position.y;
        book_box.position.z = position.z;
        book_box._position = position;
        return book_box;
    },
    showBook: function(book_box){
        var _this = this;
        if(!(book_box.isShow||this.bookLocked)){
            this.bookLocked = true;
            var m_book = book_box.children[0];
            var width = m_book.geometry.parameters.width;
            var height = m_book.geometry.parameters.height;
            var depth = m_book.geometry.parameters.depth;
            var deg = 150/180*Math.PI;
            var tween1 = new TWEEN.Tween(book_box.rotation).to({
                x: deg
            }, 500)
            var tween2 = new TWEEN.Tween(book_box.position).to({
                x: 0,
                y: -1*height/2,
            }, 500).easing(TWEEN.Easing.Cubic.Out);
            var tween3 = new TWEEN.Tween(m_book.rotation).to({
                y:0
            }, 500).easing(TWEEN.Easing.Cubic.InOut);
            var tween4 = new TWEEN.Tween(book_box.rotation).to({
                x:0
            }, 500).easing(TWEEN.Easing.Cubic.InOut);
            var tween5 = new TWEEN.Tween(book_box.position).to({
                y:0,
                z:width*1.2
            }, 500).easing(TWEEN.Easing.Cubic.Out);
            var tween6 = new TWEEN.Tween(m_book.scale).to({
                x:1.2,
                y:1.2,
                z:1.2
            }, 500).easing(TWEEN.Easing.Cubic.InOut);
            var tween7 = new TWEEN.Tween(book_box.position).to({
                y:height*0.1
            }, 500).easing(TWEEN.Easing.Cubic.InOut);

            tween1.chain(tween2).start();

            setTimeout(()=>{
                tween3.chain(tween4).start();
            },300);

            setTimeout(()=>{
                tween5.chain(tween6).start();
            },1000);

            setTimeout(()=>{
                tween7.onComplete(()=>{book_box.isShow=true;_this.bookLocked=false;}).start();
            },1500);
        }
    },
    returnBook: function(book_box){
        var _this = this;
        if(book_box.isShow&&(!this.bookLocked)){
            this.bookLocked = true;
            var m_book = book_box.children[0];
            var width = m_book.geometry.parameters.width;
            var height = m_book.geometry.parameters.height;
            var depth = m_book.geometry.parameters.depth;
            var tween1 = new TWEEN.Tween(m_book.scale).to({
                x:1,
                y:1,
                z:1
            }, 300).easing(TWEEN.Easing.Cubic.InOut);
            var tween2 = new TWEEN.Tween(book_box.position).to({
                x:book_box._position.x,
                y:0
            }, 300).easing(TWEEN.Easing.Cubic.InOut);

            var tween3 = new TWEEN.Tween(m_book.rotation).to({
                y:Math.PI/2
            }, 500).easing(TWEEN.Easing.Cubic.InOut);

            var tween4 = new TWEEN.Tween(book_box.position).to({
                z:0
            }, 300).easing(TWEEN.Easing.Cubic.InOut);

            tween1.start();
            tween2.chain(tween3).start();
            setTimeout(()=>{tween4.onComplete(()=>{book_box.isShow=false;_this.bookLocked=false;}).start()},800);
        }
    },
    createScene: function() {
        var _this = this;
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        // 创建场景
        this.scene = new THREE.Scene();
        window.scene = this.scene;

        // 创建相机
        let aspectRatio = this.WIDTH / this.HEIGHT;
        let fieldOfView = 60;
        let nearPlane = 1;
        let farPlane = 10000;
        this.camera = new THREE.PerspectiveCamera(
            fieldOfView,
            aspectRatio,
            nearPlane,
            farPlane
        );

        // 设置相机的位置
        this.camera.position.x = 0;
        this.camera.position.z = 200;
        // camera.position.y = 100;
        this.camera.position.y = 0;
        window.camera = this.camera;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            // 在 css 中设置背景色透明显示渐变色
            alpha: true,
            // 开启抗锯齿
            antialias: true
        });
        this.renderer.setClearColor(new THREE.Color(0xeeeeee));
        // 定义渲染器的尺寸；在这里它会填满整个屏幕
        this.renderer.setSize(this.WIDTH, this.HEIGHT);

        // 打开渲染器的阴影地图
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMapSoft = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // 在 HTML 创建的容器中添加渲染器的 DOM 元素
        // this.container = this.canvasContainer || document.body;
        // container = document.body;
        this.container.appendChild(this.renderer.domElement);
        // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
        window.addEventListener('resize', this.handleWindowResize.bind(this), false);
        // 为3D物体添加鼠标事件
        THREE.Object3D.prototype.on = function(eventName, touchCallback, notTouchCallback) {
            switch (eventName) {
            // 自定义hover事件
            case "hover":
                _this.container.addEventListener("mousemove", (event) => {
                    _this.handleRaycaster(event, this, (_event, _target) => {
                        this.enter = true;
                        if (this.enter != this.lastEnter && this.enter == true) {
                            touchCallback && touchCallback(_event, _target);
                            this.lastEnter = true;
                        }
                    }, (_event, _target) => {
                        this.enter = false;
                        if (this.enter != this.lastEnter && this.enter == false) {
                            notTouchCallback && notTouchCallback(_event, _target);
                            this.lastEnter = false;
                        }
                    });
                }, false);
                break;
            default:
                _this.container.addEventListener(eventName, (event) => {
                    _this.handleRaycaster(event, this, touchCallback, notTouchCallback);
                }, false);
            }
        }
        console.log("create scence");
    },
    handleRaycaster: function(event, target, touchCallback, notTouchCallback) {
        var mouse = new THREE.Vector2();
        var raycaster = new THREE.Raycaster();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        var intersects = raycaster.intersectObject(target);
        if (intersects.length > 0) {
            touchCallback && touchCallback(event, target);
        } else {
            notTouchCallback && notTouchCallback(event, target);
        }
    },
    handleAllRaycasters: function(event, touchCallback, notTouchCallback) {
        var mouse = new THREE.Vector2();
        var raycaster = new THREE.Raycaster();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        var intersects = raycaster.intersectObjects(this.scene.children, true)
        if (intersects.length > 0) {
            touchCallback && touchCallback(event, intersects);
        } else {
            notTouchCallback && notTouchCallback(event, intersects);
        }
    },
    handleWindowResize: function() {
        // 更新渲染器的高度和宽度以及相机的纵横比
        this.HEIGHT = window.innerHeight;
        this.WIDTH = window.innerWidth;
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
    },
    createLights: function() {
        this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .8);
        this.ambientLight = new THREE.AmbientLight(0xdc8874, 0.2);
        this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);

        // 开启光源投影
        this.shadowLight.castShadow = true;

        // 定义可见域的投射阴影
        this.shadowLight.shadow.camera.left = -400;
        this.shadowLight.shadow.camera.right = 400;
        this.shadowLight.shadow.camera.top = 400;
        this.shadowLight.shadow.camera.bottom = -400;
        this.shadowLight.shadow.camera.near = 1;
        this.shadowLight.shadow.camera.far = 1000;
        // this.shadowLight.shadowCameraVisible = true;

        // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
        this.shadowLight.shadow.mapSize.width = 2048;
        this.shadowLight.shadow.mapSize.height = 2048;
        this.shadowLight.position.set(50,50,50);
        // 为了使这些光源呈现效果，只需要将它们添加到场景中
        this.scene.add(this.hemisphereLight);
        this.scene.add(this.shadowLight);
        this.scene.add(this.ambientLight);
        console.log("create light");
    },
    loop: function() {
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        TWEEN.update();
        // 重新调用 render() 函数
        requestAnimationFrame(this.loop.bind(this));
    }
}
function onLoad(){
    var threeD = ThreeD.init(document.getElementById("world"));
}
