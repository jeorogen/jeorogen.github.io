window.addEventListener("load", (()=>{
    const e = document.querySelector(".builder")
      , t = e.querySelector(".upload")
      , s = e.querySelector(".download")
      , l = e.querySelector(".inner")
      , i = l.querySelector(".layers");
    let n = l.querySelector(".canvas");
    function a() {
        document.body.style.setProperty("--h", window.innerHeight + "px");
        const e = n.getBoundingClientRect();
        i.style.width = e.width + "px",
        i.style.height = e.height + "px"
    }
    t.addEventListener("change", (()=>{
        if (1 === t.files.length) {
            const e = new FileReader;
            e.onload = ()=>{
                const o = new Image;
                o.onload = ()=>function(e) {
                    const o = e.width
                      , c = e.height;
                    function r() {
                        const t = e.getBoundingClientRect()
                          , l = o / t.width
                          , n = document.createElement("canvas");
                        n.width = o,
                        n.height = c;
                        const a = n.getContext("2d");
                        a.drawImage(e, 0, 0);
                        for (const e of i.children)
                            if (e.classList.contains("text-layer")) {
                                const t = ((parseFloat(e.style.left) || 0) + 28) * l
                                  , s = ((parseFloat(e.style.top) || 0) + 16) * l
                                  , i = (parseFloat(e.style.fontSize) || 48) * l
                                  , n = e.querySelector(".text").innerHTML;
                                a.textAlign = "left",
                                a.textBaseline = "top",
                                a.font = i + "px 'CodeSaver'",
                                a.shadowColor = "#000000",
                                a.shadowBlur = i / 4,
                                a.fillText(n, t, s),
                                a.fillStyle = "#ffffff",
                                a.shadowBlur = 0,
                                a.fillText(n, t, s)
                            } else {
                                const t = e.querySelector("img")
                                  , s = parseFloat(e.style.left) * l || 0
                                  , i = parseFloat(e.style.top) * l || 0
                                  , n = t.width * l
                                  , o = t.height * l
                                  , c = e.classList.contains("flipped");
                                +e.dataset.rotate ? (a.save(),
                                a.translate(s + n / 2, i + o / 2),
                                a.rotate(+e.dataset.rotate),
                                a.translate(-s - n / 2, -i - o / 2),
                                c ? (a.scale(-1, 1),
                                a.drawImage(t, -1 * s - n, i, n, o)) : a.drawImage(t, s, i, n, o),
                                a.restore()) : c ? (a.save(),
                                a.scale(-1, 1),
                                a.drawImage(t, -1 * s - n, i, n, o),
                                a.restore()) : a.drawImage(t, s, i, n, o)
                            }
                        n.toBlob((e=>{
                            s.href = URL.createObjectURL(e),
                            s.click()
                        }
                        ), "image/jpeg")
                    }
                    let d, g;
                    function m() {
                        d && (d.element.classList.remove("selected"),
                        d = void 0),
                        g && (g.element.classList.remove("selected"),
                        g.element.contentEditable = !1,
                        g = void 0)
                    }
                    function f(e) {
                        const t = g.element.getBoundingClientRect()
                          , s = parseFloat(g.element.style.fontSize) || 48;
                        g.element.style.fontSize = Math.max(8, Math.min(160, s + e)) + "px",
                        requestAnimationFrame((()=>{
                            const e = g.element.getBoundingClientRect();
                            g.element.style.left = parseFloat(g.element.style.left) + (t.width - e.width) / 2 + "px"
                        }
                        ))
                    }
                    function p(e) {
                        return e.changedTouches ? e.changedTouches[0] : e
                    }
                    function y(e) {
                        if (e.target.classList.contains("flip"))
                            d.element.classList.toggle("flipped");
                        else if (e.target.classList.contains("remove"))
                            d ? (d.element.remove(),
                            d = void 0) : (g.element.remove(),
                            g = void 0);
                        else if (e.target.classList.contains("rotate")) {
                            const t = d.element.getBoundingClientRect()
                              , s = t.width / 2;
                            d.rotate = {
                                x: t.x + s,
                                y: t.y + s,
                                left: e.target.classList.contains("left")
                            }
                        } else if (e.target.classList.contains("resize")) {
                            const t = d.element.getBoundingClientRect();
                            d.resize = {
                                top: e.target.classList.contains("top"),
                                left: e.target.classList.contains("left"),
                                x: t.x,
                                y: t.y,
                                size: t.width
                            }
                        } else if (e.target.classList.contains("text-plus"))
                            f(2);
                        else if (e.target.classList.contains("text-minus"))
                            f(-2);
                        else if (e.target.classList.contains("move")) {
                            const t = p(e)
                              , s = g.element.getBoundingClientRect();
                            g.drag = {
                                x: t.clientX - s.x,
                                y: t.clientY - s.y
                            }
                        } else if (e.target.classList.contains("layer-t")) {
                            m();
                            const t = e.target.parentElement;
                            t.classList.add("selected");
                            const s = p(e)
                              , l = t.getBoundingClientRect();
                            d = {
                                element: t,
                                drag: {
                                    x: s.clientX - l.x,
                                    y: s.clientY - l.y
                                }
                            }
                        } else if (e.target.classList.contains("text")) {
                            m();
                            const t = e.target.parentElement;
                            t.classList.add("selected"),
                            e.target.contentEditable = "plaintext-only",
                            g = {
                                element: t
                            }
                        } else
                            (d || g) && m()
                    }
                    function u() {
                        d && (d.drag = void 0,
                        d.resize = void 0,
                        d.rotate = void 0),
                        g && (g.drag = void 0)
                    }
                    function v(e) {
                        if (e = p(e),
                        d?.drag) {
                            const t = d.element
                              , s = t.parentElement.getBoundingClientRect();
                            t.style.top = e.clientY - s.y - d.drag.y + "px",
                            t.style.left = e.clientX - s.x - d.drag.x + "px"
                        } else if (d?.resize) {
                            let {clientX: t, clientY: s} = e;
                            const l = d.resize.size;
                            const i = +d.element.dataset.rotate;
                        
                            if (i) {
                                const n = d.resize.x + l / 2,
                                      a = d.resize.y + l / 2,
                                      o = e.clientX - n,
                                      c = e.clientY - a,
                                      r = 2 * Math.PI - i;
                        
                                t = o * Math.cos(r) - c * Math.sin(r) + n;
                                s = o * Math.sin(r) + c * Math.cos(r) + a;
                            }
                        
                            const n = d.resize.left ? d.resize.x - t + l : t - d.resize.x;
                            const a = d.resize.top ? d.resize.y - s + l : s - d.resize.y;
                            
                            const minSize = 16;  // Set your minimum size here
                            const o = Math.max(minSize, Math.min(n, a));  // Adjust the minimum size limit
                        
                            const c = o - l;
                            
                            d.resize.top && (d.element.style.top = parseFloat(d.element.style.top) - c + "px",
                                             d.resize.y -= c);
                        
                            d.resize.left && (d.element.style.left = parseFloat(d.element.style.left) - c + "px",
                                              d.resize.x -= c);
                        
                            d.element.style.width = o + "px";
                            d.resize.size = o
                        } else if (d?.rotate) {
                            const t = (d.rotate.left ? Math.PI : 0) + Math.atan2(e.clientY - d.rotate.y, e.clientX - d.rotate.x);
                            d.element.dataset.rotate = t,
                            d.element.firstElementChild.style.transform = `rotate(${180 * t / Math.PI}deg)`
                        } else if (g?.drag) {
                            const t = g.element
                              , s = t.parentElement.getBoundingClientRect();
                            t.style.top = e.clientY - s.y - g.drag.y + "px",
                            t.style.left = e.clientX - s.x - g.drag.x + "px"
                        }
                    }
                    e.className = "canvas",
                    n.parentElement.replaceChild(e, n),
                    n = e,
                    t.style.display = "none",
                    i.innerHTML = "",
                    l.style.display = "block",
                    a(),
                    "ontouchstart"in l ? (l.ontouchstart = y,
                    l.ontouchend = u,
                    l.ontouchmove = v) : (l.onmousedown = y,
                    l.onmouseup = l.onmouseleave = u,
                    l.onmousemove = v),
                    l.querySelector(".tools").onclick = e=>{
                        if (e.target instanceof Image) {
                            const t = document.createElement("div");
                            t.innerHTML = 
                            `<div class="layer-t"><img src="${e.target.src}" /><div class="resize top left"></div>
                            <div class="resize bottom left"></div>
                            <div class="resize top right"></div>
                            <div class="resize bottom right"></div>
                            <div class="action flip"><img src="images/builder/flip.svg" /></div>
                            <div class="action remove"><img src="images/builder/remove.svg" /></div>
                            <div class="action rotate left"><img src="images/builder/rotate-left.svg" /></div>
                            <div class="action rotate right"><img src="images/builder/rotate-right.svg" /></div></div>`,
                            t.dataset.size = 200,
                            t.style.width = "200px",
                            t.className = "layer selected",
                            i.appendChild(t),
                            d = {
                                element: t
                            }
                        } else if (e.target.classList.contains("tool-text")) {
                            const e = n.getBoundingClientRect()
                              , t = document.createElement("div");
                            t.style.top = e.height / 2 - 33 + "px",
                            t.style.left = e.width / 2 - 114 + "px",
                            t.className = "text-layer selected",
                            t.innerHTML = '<div class="text" contenteditable="plaintext-only" spellcheck="false">sample text</div><div class="action text-plus">+</div><div class="action move"><img src="images/builder/move.svg" /></div><div class="action text-minus">-</div><div class="action remove"><img src="images/builder/remove.svg" /></div>',
                            i.appendChild(t),
                            g = {
                                element: t
                            }
                        }
                    }
                    ,
                    l.querySelector(".save").onclick = r,
                    document.onkeydown = e=>{
                        e.ctrlKey && "s" === e.key && (e.preventDefault(),
                        r())
                    }
                }(o),
                o.src = e.result
            }
            ,
            e.readAsDataURL(t.files[0])
        }
    }
    )),
    e.querySelector(".upload-wrapper").onclick = ()=>t.click(),
    l.querySelector(".reupload").onclick = ()=>t.click(),
    window.addEventListener("resize", a)
}
));
