const PIXI = require('pixi.js');
const { XMLParser, XMLBuilder, XMLValidator} = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');

const WHITE = 0xffffff
const colorNames = { "1": "Color 1", "2": "Color 2", "g": "Glow", "w": "White", "u": "UFO Dome" }
const formNames = { "player": "cube", "player_ball": "ball", "bird": "ufo", "dart": "wave" }
const qualities = { low: 'low', sd: 'low', med: 'hd', medium: 'hd', hd: 'hd' }
const positionMultipliers = { uhd: 4, hd: 2, low: 1 }
const yOffsets = { player_ball: -10, bird: 30, spider: 7, swing: -15 }
const cubeOffsets = {
    ship: { "x": 0, "y": 5, "scale": 0.55 },
    bird: { "x": 0, "y": 6, "scale": 0.55 },
    jetpack: { "x": 3, "y": 2, "scale": 0.6 }
}

const loadedAssets = {}

async function loadTexture(name, path) {
    let loaded = await PIXI.Assets.load(path)
    if (loaded) loadedAssets[name] = loaded
    return loaded
}

function downloadFile(data, name) {
    let url = window.URL.createObjectURL(data);
    let downloader = document.createElement('a');
    downloader.href = url
    downloader.setAttribute("download", name);
    document.body.appendChild(downloader);
    downloader.click();
    document.body.removeChild(downloader);
}

const loadedIcons = {}
const iconFrames = {}

function getPositionMultiplier(quality) {
    return positionMultipliers[quality || 'uhd']
}

function positionPart(part, partIndex, layer, formName, isGlow, quality) {
    let positionMultiplier = getPositionMultiplier(quality)
    layer.position.x += (part.pos[0] * positionMultiplier)
    layer.position.y -= (part.pos[1] * positionMultiplier)
    layer.scale.x = part.scale[0]
    layer.scale.y = part.scale[1]
    if (part.flipped[0]) layer.scale.x *= -1
    if (part.flipped[1]) layer.scale.y *= -1
    layer.angle = part.rotation
    layer.zIndex = part.z

    if (!isGlow) {
        let tintInfo = iconStuff.robotAnimations.info[formName].tints
        let foundTint = tintInfo[partIndex]
        if (foundTint > 0) {
            let darkenFilter = new PIXI.ColorMatrixFilter();
            darkenFilter.brightness(0)
            darkenFilter.alpha = (255 - foundTint) / 255
            layer.filters = [darkenFilter]
        }
    }
}

function validNum(val, defaultVal) {
    let colVal = +val
    return isNaN(colVal) ? defaultVal : colVal
}

function getGlowColor(colors) {
    let glowCol = Number.isInteger(colors["g"]) ? colors["g"] : (colors[2] === 0 ? colors[1] : colors[2])
    // if (glowCol === 0) glowCol = WHITE // white glow if both colors are black
    return glowCol
}

function validateIconID(id, form) {
    let realID = Math.min(iconStuff.iconCounts[form], Math.abs(validNum(id, 1)))
    if (realID == 0 && !["player", "player_ball", "ship"].includes(form)) realID = 1
    return realID
}

function parseIconColor(col) {
    if (!col && col != 0) return WHITE
    else if (typeof col == "string" && col.length >= 6) return parseInt(col, 16)
    let rgb = iconStuff.colors[col]
    return rgb ? rgbToDecimal(rgb) : WHITE;
}

function parseIconForm(form) {
    let foundForm = iconStuff.forms[form]
    return foundForm ? foundForm.form : "player"
}

function loadIconLayers(form, id, cb) {
    let iconStr = `${form}_${padZero(validateIconID(id, form))}`
    return loadIconSheet(iconStr, cb)
}

function loadIconSheet(iconStr, cb) {
    fetch(`icons/${iconStr}-uhd.plist`).then(pl => pl.text()).then(plist => {

        let data = parsePlist(plist)

        Object.keys(data.frames).forEach(x => {
            iconFrames[x] = data.frames[x]
        })

        let sheetName = iconStr + "-sheet"
        loadTexture(sheetName, `icons/${iconStr}-uhd.png`).then(texture => {
            readIconData(texture, data.pos, cb)
        })
    })
}

async function extendTexture(texture, endX, endY) {
    let img = texture.baseTexture.resource.source
    let canv = document.createElement('canvas')
    let ctx = canv.getContext('2d')
    canv.width = endX
    canv.height = endY
    ctx.drawImage(img, 0, 0)
    let url = canv.toDataURL()
    let loaded = await PIXI.Assets.load({ src: url, alias: "temp_extended_texture_" + url.slice(-32) + String(Math.random()).slice(2) })
    return loaded
}

async function readIconData(texture, data, cb, folder = loadedIcons, warnings = []) {
    let hasError = false;
    for (const x of Object.keys(data)) {
        let bounds = data[x]
        let size = bounds.rotated ? [bounds.size[1], bounds.size[0]] : bounds.size

        let textureRect = new PIXI.Rectangle(bounds.pos[0], bounds.pos[1], size[0], size[1])

        let endX = bounds.pos[0] + size[0]
        let endY = bounds.pos[1] + size[1]
        if (endX > texture.width || endY > texture.height) {
            if (warnings.length < 1) alert(`Warning: Frame '${x}' expects pixels outside of the width/height of the image file! This is supported by Geometry Dash, but should never happen. ` +
                `\n\nThe image will be automatically extended, but please consider fixing your sprite offset.\n\nX pos: ${endX} (width: ${texture.width})\nY pos: ${endY} (height: ${texture.height})`)
            warnings.push(x)
            if (warnings.length > 99) return

            hasError = true
            let newTexture = await extendTexture(texture, Math.max(endX, texture.width), Math.max(endY, texture.height))
            readIconData(newTexture, data, cb, folder, warnings)
            break;
        }

        let partTexture = new PIXI.Texture(texture, textureRect)
        folder[x] = partTexture
    }

    if (cb && !hasError) {
        if (warnings.length > 1) alert("The same issue also applies to:\n\n" + warnings.join("\n"))
        cb(texture, loadedAssets, true)
    }
}

const xmlOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseNodeValue: true,
    ignorePiTags: true,
    parseAttributeValue: false,
};
let parser = new XMLParser(xmlOptions);
function parsePlist(data) {
    let plist = parser.parse(data);
    console.log(JSON.stringify(plist));
    let frames = plist.children[0].children[0].children[1].children
    let positionData = {}
    let dataFrames = {}
    for (let i = 0; i < frames.length; i += 2) {
        let frameName = frames[i].innerHTML
        let frameData = frames[i + 1].children
        let isRotated = false
        dataFrames[frameName] = {}
        positionData[frameName] = {}

        for (let n = 0; n < frameData.length; n += 2) {
            let keyName = frameData[n].innerHTML
            let keyData = frameData[n + 1].innerHTML
            if (["spriteOffset", "spriteSize", "spriteSourceSize"].includes(keyName)) {
                dataFrames[frameName][keyName] = parseWeirdArray(keyData)
            }

            else if (keyName == "textureRotated") {
                isRotated = frameData[n + 1].outerHTML.includes("true")
                dataFrames[frameName][keyName] = isRotated
            }

            else if (keyName == "textureRect") {
                let textureArr = keyData.slice(1, -1).split("},{").map(x => parseWeirdArray(x))
                positionData[frameName].pos = textureArr[0]
                positionData[frameName].size = textureArr[1]
            }
        }

        if (isRotated) {
            if (dataFrames[frameName].spriteSize.join(",") == positionData[frameName].size.join(",")) {
                positionData[frameName].size.reverse()
            }
        }

    }
    return { pos: positionData, frames: dataFrames }
}

parsePlist(fs.readFileSync(path.join(__dirname, 'icons/bird_01-uhd.plist')))

function parseWeirdArray(data) {
    return data.replace(/[^0-9,-.]/g, "").split(",").map(x => +x)
}

function padZero(num) {
    if (isNaN(num)) return num
    let numStr = num.toString()
    if (num < 10) numStr = "0" + numStr
    return numStr
}

function rgbToDecimal(rgb) {
    return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
}

class Icon {
    constructor(data = {}, cb) {
        this.app = data.app
        this.sprite = new PIXI.Container();
        this.form = data.form || "player"
        this.id = data.isCustom ? data.id : validateIconID(data.id, this.form)
        this.colors = data.rawColors || {
            "1": validNum(data.col1, 0xafafaf),    // primary
            "2": validNum(data.col2, WHITE),       // secondary
            "g": validNum(data.colG, validNum(+data.colg, null)), // glow
            "w": validNum(data.colW, validNum(+data.colw, WHITE)), // white
            "u": validNum(data.colU, validNum(+data.colu, WHITE)), // ufo
        }

        if (data.colG == null) this.colors.g = null

        this.glow = !!data.glow
        this.layers = []
        this.glowLayers = []
        this.customFiles = null
        this.complex = ["spider", "robot"].includes(this.form)
        this.quality = data.quality ? (qualities[data.quality.toLowerCase()] || 'uhd') : 'uhd'

        if (data.isCustom && data.files) this.customFiles = data.files

        // most forms
        if (!this.complex) {
            let extraSettings = {}
            if (data.noUFODome) extraSettings.noDome = true
            if (data.isCustom) extraSettings.customFiles = this.customFiles
            if (this.form == "player_ball") {
                this.ballSpeed = (data.ballSpeed || 0)
                if (this.ballSpeed != 0 && !this.ballRolling) this.rollBall()
            }
            let basicIcon = new IconPart(this.form, this.id, this.colors, this.glow, extraSettings)
            this.sprite.addChild(basicIcon.sprite)
            this.layers.push(basicIcon)

            let foundGlow = basicIcon.sections.find(x => x.colorType == "g")
            if (foundGlow) this.glowLayers.push(foundGlow)
        }

        // spider + robot
        else {
            let idlePosition = this.getAnimation(data.animation, data.animationForm).frames[0]
            let cFiles = data.isCustom ? this.customFiles : undefined
            idlePosition.forEach((x, y) => {
                x.name = iconStuff.robotAnimations.info[this.form].names[y]
                let part = new IconPart(this.form, this.id, this.colors, false, { part: x, skipGlow: true, customFiles: cFiles })
                positionPart(x, y, part.sprite, this.form, false, this.quality)

                let glowPart = new IconPart(this.form, this.id, this.colors, true, { part: x, onlyGlow: true, customFiles: cFiles })
                positionPart(x, y, glowPart.sprite, this.form, true, this.quality)
                glowPart.sprite.visible = (this.glow || this.colors[1] === 0)
                this.glowLayers.push(glowPart)

                this.layers.push(part)
                this.sprite.addChild(part.sprite)
            })

            let fullGlow = new PIXI.Container();
            this.glowLayers.forEach(x => fullGlow.addChild(x.sprite))
            this.sprite.addChildAt(fullGlow, 0)
            if (typeof Ease !== "undefined") this.ease = new Ease.Ease()
            this.animationSpeed = Math.abs(Number(data.animationSpeed) || 1)
            if (data.animation) this.setAnimation(data.animation, data.animationForm)
        }

        if (this.quality != 'uhd') this.sprite.scale.set(4 / getPositionMultiplier(this.quality))

        if (!data.dontAdd) {
            this.app.stage.removeChildren()
            this.app.stage.addChild(this.sprite)
        }

        if (cb) cb(this)

    }

    updatePosition() {
        this.sprite.position.set(this.app.renderer.width / 2, (this.app.renderer.height / 2) + (yOffsets[this.form] || 0))
    }

    getAllLayers() {
        let allLayers = [];
        (this.complex ? this.glowLayers : []).concat(this.layers).forEach(x => x.sections.forEach(s => allLayers.push(s)))
        return allLayers
    }

    getLayerArr() {
        if (!this.complex) return this.layers
        else return this.layers.concat({ sections: this.glowLayers.map(x => x.sections[0]), part: { name: "Glow" } })
    }

    setColor(colorType, newColor, extra = {}) {
        let colorStr = String(colorType).toLowerCase()
        if (!colorType || !Object.keys(this.colors).includes(colorStr)) return
        else this.colors[colorStr] = newColor
        let newGlow = getGlowColor(this.colors)
        this.getAllLayers().forEach(x => {
            if (colorType != "g" && x.colorType == colorStr) x.setColor(newColor)
            if (!extra.ignoreGlow && x.colorType == "g") x.setColor(newGlow)
        })
        if (!this.glow && colorStr == "1") {
            let shouldGlow = newColor == 0
            this.glowLayers.forEach(x => x.sprite.visible = shouldGlow)
        }

        if (this.secondaryIcon) this.secondaryIcon.setColor(colorType, newColor, extra)
    }

    copyColorsFrom(i1) {
        Object.entries(i1.colors).forEach(c => {
            this.setColor(c[0], c[1])
        })
    }

    setGlow(toggle) {
        this.glow = !!toggle
        this.glowLayers.forEach(x => x.sprite.visible = (this.colors["1"] == 0 || this.glow))

        if (this.secondaryIcon) this.secondaryIcon.setGlow(toggle)
    }

    formName() {
        return formNames[this.form] || this.form
    }

    isGlowing() {
        return this.glowLayers[0] && this.glowLayers[0].sprite.visible
    }

    // icon inside ships, ufos, etc
    addSecondaryIcon(id = 1, skipLoad, cb) {
        let offset = cubeOffsets[this.form]
        if (!offset) return

        let providedIcon = (typeof id == "object" && id.sprite)

        if (!providedIcon && !skipLoad) return loadIconLayers("player", id, () => this.addSecondaryIcon(id, true, cb))

        let i2 = providedIcon ? id : new Icon({
            app: this.app, form: "player", id, dontAdd: true,
            rawColors: this.colors, glow: this.glow
        })

        // remove existing
        if (this.secondaryIcon) this.removeSecondaryIcon()

        this.secondaryIcon = i2

        let iconScale = getPositionMultiplier(this.quality) / 4

        i2.sprite.scale.set(offset.scale * iconScale)
        i2.sprite.position.set(offset.x * 8 * iconScale, offset.y * -8 * iconScale)
        this.sprite.children[0].addChildAt(i2.sprite, 1)

        if (providedIcon) {
            i2.copyColorsFrom(this)
            i2.setGlow(this.glow)
        }

        if (cb) cb(this)
    }

    removeSecondaryIcon(destroy) {
        if (this.secondaryIcon) {
            if (destroy) this.secondaryIcon.sprite.destroy()
            else this.sprite.children[0].children = this.sprite.children[0].children.filter(x => x != this.secondaryIcon.sprite)
            this.secondaryIcon = null
        }
    }

    setBallSpeed(speed, stop) {
        if (this.form != "player_ball") return
        this.ballSpeed = speed

        if (stop) this.sprite.angle = 0
        else if (this.ballSpeed != 0 && !this.ballRolling) this.rollBall()
    }

    rollBall() {
        if (!this.ballSpeed) return this.ballRolling = false
        this.ballRolling = true
        this.sprite.angle += this.ballSpeed
        requestAnimationFrame(() => this.rollBall())
    }

    getAnimation(name, animForm) {
        let animationList = iconStuff.robotAnimations.animations[animForm || this.form]
        return animationList[name || "idle"] || animationList["idle"]
    }

    clearAnimation() {
        this.ease.removeAll()
        this.isRecording = false
        this.recordedFrames = []
        this.animationFrame = 0
    }

    setAnimation(data, animForm) {
        let animData = this.getAnimation(data, animForm) || this.getAnimation("idle")
        this.clearAnimation()
        this.animationName = data
        this.runAnimation(animData, data)
    }

    runAnimation(animData, animName, duration) {
        animData.frames[this.animationFrame].forEach((newPart, index) => {
            let section = this.layers[index]
            let glowSection = this.glowLayers[index]
            let truePosMultiplier = getPositionMultiplier(this.quality)
            if (!section) return

            // gd is weird with negative rotations
            // this isn't perfect (e.g. robot run2) but it's the best i can do
            let realRot = newPart.rotation
            if (realRot < -180) realRot += 360

            let movementData = {
                x: newPart.pos[0] * truePosMultiplier,
                y: newPart.pos[1] * truePosMultiplier * -1,
                scaleX: newPart.scale[0],
                scaleY: newPart.scale[1],
                angle: realRot
            }
            if (newPart.flipped[0]) movementData.scaleX *= -1
            if (newPart.flipped[1]) movementData.scaleY *= -1

            let dur = (!duration ? 1 : (animData.info.duration / (this.animationSpeed || 1)))
            let bothSections = [section, glowSection]
            bothSections.forEach((x, y) => {
                let easing = this.ease.add(x.sprite, movementData, { duration: duration || 1, ease: 'linear' })
                let continueAfterEase = animData.frames.length > 1 && y == 0 && index == 0 && animName == this.animationName
                if (continueAfterEase) easing.on('complete', () => {
                    this.animationFrame++
                    if (this.animationFrame >= animData.frames.length) {
                        if (animData.info.loop) {
                            this.animationFrame = 0;
                        }
                        else setTimeout(() => {
                            this.animationFrame = 0;
                            this.runAnimation(animData, animName, dur);
                        }, 1000);
                    }
                    if (this.animationFrame < animData.frames.length) this.runAnimation(animData, animName, dur)
                })
            })
        })
    }

    recordAnimation(animName = this.animationName) {
        alert("work in progress!!! if you found this function then feel free to use, but looping is bugged rn")

        if (!this.animationFrame || this.animationSpeed < 0.1) return

        let w = this.app.view.width
        let h = this.app.view.height

        // needed because so canvas doesn't autocrop :v
        let bounds = new PIXI.Graphics();
        bounds.lineStyle(1, 0xFF0000);
        bounds.drawRect(0, 0, w - 1, h - 1);
        bounds.alpha = 0
        this.app.stage.addChild(bounds);

        const RECORDING_FPS = (this.animationSpeed <= 0.5 ? 30 : 60)
        const FRAME_DELAY = (1000 / RECORDING_FPS)

        this.setAnimation(animName)
        this.isRecording = true
        this.recordedFrames = []

        let firstFrame = -1
        let passedFrame = false

        let snapFrame = () => {
            if (firstFrame == -1 && this.animationFrame == 0) return // no idea why this works but removing it breaks things

            let frame = new Uint8Array(this.app.renderer.extract.pixels(this.app.stage)).buffer
            console.log([this.animationFrame, firstFrame])

            if (firstFrame == -1) firstFrame = this.animationFrame  // on first frame
            else if (firstFrame != this.animationFrame) passedFrame = true  // on passing first frame
            else if (passedFrame) { // on returning to first frame
                clearInterval(recorder)
                this.app.stage.removeChild(bounds)
                this.isRecording = false

                let apng = UPNG.encode(this.recordedFrames, w, h, 0, new Array(this.recordedFrames.length).fill(FRAME_DELAY))
                console.log(apng)
                let apngBlob = new Blob([apng], { type: "image/png" })
                downloadFile(apngBlob, this.getDownloadString() + "_" + animName + ".png")

                return
            }

            this.recordedFrames.push(frame)
        }

        let recorder = setInterval(async () => {
            snapFrame()
        }, FRAME_DELAY);
        snapFrame()
    }

    async getDataURL() {
        let [imgData, pixels] = await Promise.all([
            this.app.renderer.extract.image(this.sprite, "image/png", 1),
            this.app.renderer.extract.pixels(this.sprite)
        ]);

        let spriteSize = [imgData.width, imgData.height]

        let xRange = [spriteSize[0], 0]
        let yRange = [spriteSize[1], 0]

        for (let i = 3; i < pixels.length; i += 4) {
            let alpha = pixels[i]
            let realIndex = (i - 3) / 4
            let pos = [realIndex % spriteSize[0], Math.floor(realIndex / spriteSize[0])]

            if (alpha > 10) { // if pixel is not blank...
                if (pos[0] < xRange[0]) xRange[0] = pos[0]      // if x pos is < the lowest x pos so far
                else if (pos[0] > xRange[1]) xRange[1] = pos[0] // if x pos is > the highest x pos so far
                if (pos[1] < yRange[0]) yRange[0] = pos[1]      // if y pos is < the lowest y pos so far
                else if (pos[1] > yRange[1]) yRange[1] = pos[1] // if y pos is > the highest y pos so far
            }
        }

        xRange[1]++
        yRange[1]++

        let canv = document.createElement("canvas")
        let ctx = canv.getContext('2d')

        canv.width = xRange[1] - xRange[0]
        canv.height = yRange[1] - yRange[0]
        ctx.drawImage(imgData, -xRange[0], -yRange[0])

        return canv.toDataURL("image/png")
    }

    getDownloadString() {
        return `${this.formName()}_${this.id}`
    }

    async pngExport() {
        let b64data = await this.getDataURL()
        let downloader = document.createElement('a');
        downloader.href = b64data
        downloader.setAttribute("download", `${this.getDownloadString()}.png`);
        document.body.appendChild(downloader);
        downloader.click();
        document.body.removeChild(downloader);
    }

    async copyToClipboard() {
        let b64data = await this.getDataURL()
        let blob = await fetch(b64data).then(res => res.blob())
        if (typeof ClipboardItem == "undefined") return alert("Clipboard copying is not supported on this browser! :(")
        let item = new ClipboardItem({ [blob.type]: blob });
        navigator.clipboard.write([item]);
    }

    psdExport() {
        if (typeof agPsd === "undefined") throw new Error("ag-psd not imported!")
        let glowing = this.isGlowing()
        this.setGlow(true)

        let psd = { width: this.app.stage.width, height: this.app.stage.height, children: [] }

        let ic2 = this.secondaryIcon ? this.secondaryIcon.getAllLayers() : []
        let allLayers = this.getAllLayers().concat(ic2)
        let renderer = this.app.renderer
        let complex = this.complex

        function addPSDLayer(layer, parent, sprite) {
            allLayers.forEach(x => x.sprite.alpha = 0)
            layer.sprite.alpha = 255

            let layerChild = { name: layer.colorName, canvas: renderer.extract.canvas(sprite) }
            if (layer.colorType == "g") {
                if (parent.part) layerChild.name = parent.part.name + " glow"
                if (!complex && !glowing) layerChild.hidden = true
            }
            return layerChild
        }

        let diffIcons = [this]
        if (this.secondaryIcon) diffIcons.push(this.secondaryIcon)

        diffIcons.forEach((i, idx) => {
            i.layers.forEach(x => {
                let iconType = (formNames[i.form] || i.form)

                let partName = x.part ? x.part.name : (iconType[0].toUpperCase() + iconType.slice(1))
                let folder = {
                    name: partName,
                    children: x.sections.map(layer => addPSDLayer(layer, x, this.sprite)),
                    opened: true
                }
                if (idx == 0) psd.children.push(folder)      // main icon
                else psd.children[0].children.splice(1, 0, folder)    // secondary icon
            })
        })

        if (complex) {
            let glowFolder = { name: "Glow", children: [], opened: true, hidden: !glowing }
            glowFolder.children = this.glowLayers.map(x => addPSDLayer(x.sections[0], x, this.sprite))
            psd.children.unshift(glowFolder)
        }

        allLayers.forEach(x => x.sprite.alpha = 255)
        let output = agPsd.writePsd(psd)
        let blob = new Blob([output]);
        downloadFile(blob, `${this.getDownloadString()}.psd`)
        this.setGlow(glowing)
    }

    destroy() {
        if (this.ease) this.ease.destroy()
        this.sprite.destroy()
    }
}

class IconPart {
    constructor(form, id, colors, glow, misc = {}) {

        if (colors[1] === 0 && !misc.skipGlow) glow = true // add glow if p1 is black

        let iconPath = `${form}_${padZero(id)}`
        let partString = misc.part ? "_" + padZero(misc.part.part) : ""

        let sections = {}
        if (misc.part) this.part = misc.part

        this.sprite = new PIXI.Container();
        this.sections = []

        if (!misc.skipGlow) {
            let glowCol = getGlowColor(colors)
            let glowPath = `${iconPath}${partString}_glow_001.png`

            if (misc.customFiles) {
                let foundCustomGlow = misc.customFiles[glowPath]
                if (!foundCustomGlow) {
                    alert(`Warning: This icon's glow texture (${glowPath}) could not be found! It will be rendered without a glow layer.`)
                    glowPath = null
                }
            }

            if (glowPath) {
                sections.glow = new IconLayer(glowPath, glowCol, "g", misc.customFiles)
                if (!glow) sections.glow.sprite.visible = false
            }

        }

        if (!misc.onlyGlow) {
            if (form == "bird") { // ufo top
                sections.ufo = new IconLayer(`${iconPath}_3_001.png`, WHITE, "u", misc.customFiles)
                if (misc.noDome) sections.ufo.sprite.visible = false
            }

            sections.col1 = new IconLayer(`${iconPath}${partString}_001.png`, colors["1"], "1", misc.customFiles)
            sections.col2 = new IconLayer(`${iconPath}${partString}_2_001.png`, colors["2"], "2", misc.customFiles)

            let extraPath = `${iconPath}${partString}_extra_001.png`
            let hasExtra = misc.customFiles ? misc.customFiles[extraPath] : iconFrames[extraPath]
            if (hasExtra) {
                sections.white = new IconLayer(extraPath, colors["w"], "w", misc.customFiles)
            }
        }

        let layerOrder = ["glow", "ufo", "col2", "col1", "white"].map(x => sections[x]).filter(x => x)
        layerOrder.forEach(x => {
            this.sections.push(x)
            this.sprite.addChild(x.sprite)
        })
    }
}

class IconLayer {
    constructor(path, color, colorType, customFiles) {

        let loadedTexture = loadedIcons[path]

        if (customFiles) {
            let customPath = customFiles[path];
            if (!customPath) throw new Error(`Could not find texture: ${path}`)
            loadedTexture = customPath.texture
        }

        let loadedOffsets = iconFrames[path]
        if (customFiles) loadedOffsets = customFiles[path].frames

        this.offsets = loadedOffsets || { spriteOffset: [0, 0] }
        this.sprite = new PIXI.Sprite(loadedTexture || PIXI.Texture.EMPTY)
        this.name = path

        this.colorType = colorType
        this.colorName = colorNames[colorType]
        this.setColor(color)
        this.applyOffset()

        if (this.offsets.textureRotated) {
            this.sprite.angle = -90
        }
        this.angleOffset = this.sprite.angle

        this.sprite.anchor.set(0.5)
    }

    applyOffset() {
        this.sprite.position.x = Math.floor(this.offsets.spriteOffset[0] || 0)
        this.sprite.position.y = Math.floor(this.offsets.spriteOffset[1] || 0) * -1
    }

    setColor(color) {
        this.color = validNum(color, WHITE)
        this.sprite.tint = this.color
    }
}

