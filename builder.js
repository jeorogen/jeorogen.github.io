window.addEventListener("load", () => {
    const builder = document.querySelector(".builder"),
          uploadInput = builder.querySelector(".upload"),
          downloadLink = builder.querySelector(".download"),
          inner = builder.querySelector(".inner"),
          layers = inner.querySelector(".layers");

    let canvas = inner.querySelector(".canvas");

    function resizeCanvas() {
        document.body.style.setProperty("--h", window.innerHeight + "px");
        const canvasRect = canvas.getBoundingClientRect();
        layers.style.width = canvasRect.width + "px";
        layers.style.height = canvasRect.height + "px";
    }

    uploadInput.addEventListener("change", () => {
        if (uploadInput.files.length === 1) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    loadImageToCanvas(img);
                };
                img.src = fileReader.result;
            };
            fileReader.readAsDataURL(uploadInput.files[0]);
        }
    });

    function loadImageToCanvas(image) {
        const imgWidth = image.width;
        const imgHeight = image.height;

        function saveImage() {
            const canvasRect = image.getBoundingClientRect(),
                  scaleFactor = imgWidth / canvasRect.width,
                  tempCanvas = document.createElement("canvas");
                  
            tempCanvas.width = imgWidth;
            tempCanvas.height = imgHeight;
            const context = tempCanvas.getContext("2d");
            context.drawImage(image, 0, 0);

            // Add all layers (text and images) to the canvas
            for (const layer of layers.children) {
                if (layer.classList.contains("text-layer")) {
                    const textLeft = ((parseFloat(layer.style.left) || 0) + 28) * scaleFactor,
                          textTop = ((parseFloat(layer.style.top) || 0) + 16) * scaleFactor,
                          textSize = (parseFloat(layer.style.fontSize) || 48) * scaleFactor,
                          textContent = layer.querySelector(".text").innerHTML;

                    context.textAlign = "left";
                    context.textBaseline = "top";
                    context.font = `${textSize}px 'CodeSaver'`;
                    context.shadowColor = "#000000";
                    context.shadowBlur = textSize / 4;
                    context.fillText(textContent, textLeft, textTop);
                    context.fillStyle = "#ffffff";
                    context.shadowBlur = 0;
                    context.fillText(textContent, textLeft, textTop);
                } else {
                    const imgElement = layer.querySelector("img"),
                          imgLeft = parseFloat(layer.style.left) * scaleFactor || 0,
                          imgTop = parseFloat(layer.style.top) * scaleFactor || 0,
                          imgWidth = imgElement.width * scaleFactor,
                          imgHeight = imgElement.height * scaleFactor,
                          flipped = layer.classList.contains("flipped");

                    if (+layer.dataset.rotate) {
                        context.save();
                        context.translate(imgLeft + imgWidth / 2, imgTop + imgHeight / 2);
                        context.rotate(+layer.dataset.rotate);
                        context.translate(-imgLeft - imgWidth / 2, -imgTop - imgHeight / 2);
                        if (flipped) {
                            context.scale(-1, 1);
                            context.drawImage(imgElement, -imgLeft - imgWidth, imgTop, imgWidth, imgHeight);
                        } else {
                            context.drawImage(imgElement, imgLeft, imgTop, imgWidth, imgHeight);
                        }
                        context.restore();
                    } else if (flipped) {
                        context.save();
                        context.scale(-1, 1);
                        context.drawImage(imgElement, -imgLeft - imgWidth, imgTop, imgWidth, imgHeight);
                        context.restore();
                    } else {
                        context.drawImage(imgElement, imgLeft, imgTop, imgWidth, imgHeight);
                    }
                }
            }

            tempCanvas.toBlob((blob) => {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.click();
            }, "image/jpeg");
        }

        let selectedLayer, textEditLayer;

        function deselectLayers() {
            if (selectedLayer) {
                selectedLayer.element.classList.remove("selected");
                selectedLayer = undefined;
            }
            if (textEditLayer) {
                textEditLayer.element.classList.remove("selected");
                textEditLayer.element.contentEditable = false;
                textEditLayer = undefined;
            }
        }

        function changeTextSize(amount) {
            const textRect = textEditLayer.element.getBoundingClientRect(),
                  currentFontSize = parseFloat(textEditLayer.element.style.fontSize) || 48;
            textEditLayer.element.style.fontSize = Math.max(8, Math.min(160, currentFontSize + amount)) + "px";
            requestAnimationFrame(() => {
                const newRect = textEditLayer.element.getBoundingClientRect();
                textEditLayer.element.style.left = parseFloat(textEditLayer.element.style.left) + (textRect.width - newRect.width) / 2 + "px";
            });
        }

        function getTouchOrMouseEvent(e) {
            return e.changedTouches ? e.changedTouches[0] : e;
        }

        function handleLayerEvents(e) {
            const target = e.target;
            if (target.classList.contains("flip")) {
                selectedLayer.element.classList.toggle("flipped");
            } else if (target.classList.contains("remove")) {
                if (selectedLayer) {
                    selectedLayer.element.remove();
                    selectedLayer = undefined;
                } else {
                    textEditLayer.element.remove();
                    textEditLayer = undefined;
                }
            } else if (target.classList.contains("rotate")) {
                const layerRect = selectedLayer.element.getBoundingClientRect(),
                      rotateCenterX = layerRect.width / 2;
                selectedLayer.rotate = {
                    x: layerRect.x + rotateCenterX,
                    y: layerRect.y + rotateCenterX,
                    left: target.classList.contains("left")
                };
            } else if (target.classList.contains("resize")) {
                const layerRect = selectedLayer.element.getBoundingClientRect();
                selectedLayer.resize = {
                    top: target.classList.contains("top"),
                    left: target.classList.contains("left"),
                    x: layerRect.x,
                    y: layerRect.y,
                    size: layerRect.width
                };
            } else if (target.classList.contains("text-plus")) {
                changeTextSize(2);
            } else if (target.classList.contains("text-minus")) {
                changeTextSize(-2);
            } else if (target.classList.contains("move")) {
                const pointer = getTouchOrMouseEvent(e),
                      textRect = textEditLayer.element.getBoundingClientRect();
                textEditLayer.drag = {
                    x: pointer.clientX - textRect.x,
                    y: pointer.clientY - textRect.y
                };
            } else if (target.classList.contains("layer-t")) {
                deselectLayers();
                const layerElement = target.parentElement;
                layerElement.classList.add("selected");
                const pointer = getTouchOrMouseEvent(e),
                      layerRect = layerElement.getBoundingClientRect();
                selectedLayer = {
                    element: layerElement,
                    drag: {
                        x: pointer.clientX - layerRect.x,
                        y: pointer.clientY - layerRect.y
                    }
                };
            } else if (target.classList.contains("text")) {
                deselectLayers();
                const layerElement = target.parentElement;
                layerElement.classList.add("selected");
                target.contentEditable = "plaintext-only";
                textEditLayer = {
                    element: layerElement
                };
            } else {
                if (selectedLayer || textEditLayer) {
                    deselectLayers();
                }
            }
        }

        function endDrag() {
            if (selectedLayer) {
                selectedLayer.drag = undefined;
                selectedLayer.resize = undefined;
                selectedLayer.rotate = undefined;
            }
            if (textEditLayer) {
                textEditLayer.drag = undefined;
            }
        }

        function moveLayer(e) {
            const pointer = getTouchOrMouseEvent(e);
            if (selectedLayer?.drag) {
                const layerElement = selectedLayer.element,
                      layerParentRect = layerElement.parentElement.getBoundingClientRect();
                layerElement.style.top = pointer.clientY - layerParentRect.y - selectedLayer.drag.y + "px";
                layerElement.style.left = pointer.clientX - layerParentRect.x - selectedLayer.drag.x + "px";
            } else if (selectedLayer?.resize) {
                let { clientX: x, clientY: y } = pointer,
                    layerRect = selectedLayer.resize,
                    resizeSize = layerRect.size,
                    rotateAngle = +selectedLayer.element.dataset.rotate;
                if (rotateAngle) {
                    const centerX = layerRect.x + resizeSize / 2,
                          centerY = layerRect.y + resizeSize / 2,
                          deltaX = x - centerX,
                          deltaY = y - centerY,
                          rotation = 2 * Math.PI - rotateAngle;
                    x = deltaX * Math.cos(rotation) - deltaY * Math.sin(rotation) + centerX;
                    y = deltaX * Math.sin(rotation) + deltaY * Math.cos(rotation) + centerY;
                }
                const widthDiff = selectedLayer.resize.left ? selectedLayer.resize.x - x + resizeSize : x - selectedLayer.resize.x,
                      heightDiff = selectedLayer.resize.top ? selectedLayer.resize.y - y + resizeSize : y - selectedLayer.resize.y,
                      newSize = Math.max(64, Math.min(widthDiff, heightDiff)),
                      sizeDiff = newSize - resizeSize;

                if (selectedLayer.resize.top) {
                    selectedLayer.element.style.top = parseFloat(selectedLayer.element.style.top) - sizeDiff + "px";
                    selectedLayer.resize.y -= sizeDiff;
                }
                if (selectedLayer.resize.left) {
                    selectedLayer.element.style.left = parseFloat(selectedLayer.element.style.left) - sizeDiff + "px";
                    selectedLayer.resize.x -= sizeDiff;
                }
                selectedLayer.element.style.width = newSize + "px";
                selectedLayer.resize.size = newSize;
            } else if (selectedLayer?.rotate) {
                const rotateAngle = (selectedLayer.rotate.left ? Math.PI : 0) + Math.atan2(pointer.clientY - selectedLayer.rotate.y, pointer.clientX - selectedLayer.rotate.x);
                selectedLayer.element.dataset.rotate = rotateAngle;
                selectedLayer.element.firstElementChild.style.transform = `rotate(${180 * rotateAngle / Math.PI}deg)`;
            } else if (textEditLayer?.drag) {
                const textElement = textEditLayer.element,
                      textParentRect = textElement.parentElement.getBoundingClientRect();
                textElement.style.top = pointer.clientY - textParentRect.y - textEditLayer.drag.y + "px";
                textElement.style.left = pointer.clientX - textParentRect.x - textEditLayer.drag.x + "px";
            }
        }

        // Replace old canvas and initialize new one
        image.className = "canvas";
        canvas.parentElement.replaceChild(image, canvas);
        canvas = image;
        uploadInput.style.display = "none";
        layers.innerHTML = "";
        inner.style.display = "block";
        resizeCanvas();

        // Add touch/mouse event listeners
        if ("ontouchstart" in inner) {
            inner.ontouchstart = handleLayerEvents;
            inner.ontouchend = endDrag;
            inner.ontouchmove = moveLayer;
        } else {
            inner.onmousedown = handleLayerEvents;
            inner.onmouseup = inner.onmouseleave = endDrag;
            inner.onmousemove = moveLayer;
        }

        inner.querySelector(".tools").onclick = (e) => {
            if (e.target instanceof Image) {
                const layerDiv = document.createElement("div");
                layerDiv.innerHTML = `
                    <div class="layer-t">
                        <img src="${e.target.src}" />
                        <div class="resize top left"></div>
                        <div class="resize bottom left"></div>
                        <div class="resize top right"></div>
                        <div class="resize bottom right"></div>
                        <div class="action flip"><img src="images/builder/flip.svg" /></div>
                        <div class="action remove"><img src="images/builder/remove.svg" /></div>
                        <div class="action rotate left"><img src="images/builder/rotate-left.svg" /></div>
                        <div class="action rotate right"><img src="images/builder/rotate-right.svg" /></div>
                    </div>`;
                layerDiv.dataset.size = 200;
                layerDiv.style.width = "200px";
                layerDiv.className = "layer selected";
                layers.appendChild(layerDiv);
                selectedLayer = {
                    element: layerDiv
                };
            } else if (e.target.classList.contains("tool-text")) {
                const canvasRect = canvas.getBoundingClientRect(),
                      textLayerDiv = document.createElement("div");
                textLayerDiv.style.top = canvasRect.height / 2 - 33 + "px";
                textLayerDiv.style.left = canvasRect.width / 2 - 114 + "px";
                textLayerDiv.className = "text-layer selected";
                textLayerDiv.innerHTML = `
                    <div class="text" contenteditable="plaintext-only" spellcheck="false">sample text</div>
                    <div class="action text-plus">+</div>
                    <div class="action move"><img src="images/builder/move.svg" /></div>
                    <div class="action text-minus">-</div>
                    <div class="action remove"><img src="images/builder/remove.svg" /></div>`;
                layers.appendChild(textLayerDiv);
                textEditLayer = {
                    element: textLayerDiv
                };
            }
        };

        inner.querySelector(".save").onclick = saveImage;

        document.onkeydown = (e) => {
            if (e.ctrlKey && e.key === "s") {
                e.preventDefault();
                saveImage();
            }
        };
    }

    // Trigger upload input
    builder.querySelector(".upload-wrapper").onclick = () => uploadInput.click();
    inner.querySelector(".reupload").onclick = () => uploadInput.click();
    window.addEventListener("resize", resizeCanvas);
});
