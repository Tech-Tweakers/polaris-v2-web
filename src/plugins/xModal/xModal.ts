export interface iModalCreate {
  btnFocus: Function;
  btnDisable: Function;
  btnEnable: Function;
  btnClick: Function;
  setTitle: Function;
  btnFooter: Function;
  destroy: Function;
  open: Function;
  close: Function;
}

export interface iModal {
  el: string;
  title?: string;
  buttons?: {
    [nameButton: string]: {
      html: string;
      class?: string;
      click: (e?: any, dataOpen?: any) => void;
    };
  };
  onClose?: () => void;
  onOpen?: (data?: any) => void;
  resize?: boolean | [boolean, boolean, boolean, boolean];
  onCreate?: Function;
  theme?:
  | "xModal-blue"
  | "xModal-opacity"
  | "xModal-dark"
  | "xModal-dark-square"
  | "xModal-bublue"
  | "xModal-v23";
  width?: number;
  height?: number;
  fullScreen?: boolean | true;
  closeBtn?: boolean;
  hash?: boolean;
  execAfter?: { time: number; btn: string };
  esc?: boolean;
  modal?: boolean;
  titleDisplay?: boolean;
  onKeyDown?: {
    [cod_key: string]: (e?: any) => void;
    // [codKey in keys]?: Function
  };
}

// [codKey in keys]?: Function

//type keys = 'F1' | 'F2' | 'F3' |;

export default (function () {
  //let xModal = (function () {
  const btnProperty = {
    html: "text button",
    class: "class button",
    click: "function button",
  };

  const themes = {
    "xModal-blue": 1,
    "xModal-dark": 2,
    "xModal-opacity": 3,
    "xModal-dark-square": 4,
    "xModal-bublue": 5,
    "xModal-dark-mobile": 6,
    "xModal-v23": 7,
  };

  let defaultTheme = "xModal-bublue";

  function setCss(path) {
    path = path == undefined ? "./xModal.css" : `${path}xModal.css`;
    let style = document.createElement("link");
    style.setAttribute("href", path);
    style.setAttribute("rel", "stylesheet");
    document.head.appendChild(style);
  }

  let timeExecAfter = {};

  let dialogs = {
    dialogsOpen: {},
    onClose: {},
    execAfter: {},
    keyEsc: {},
    onKeyDown: {},
    // created: []
  };

  function countIsOpen() {
    return Object.keys(dialogs.dialogsOpen).length;
  }

  function execAfterFunc(buttons, id) {
    let exec = dialogs.execAfter[id];
    let text = buttons[exec.btn].innerText;
    let time = exec.time;

    timeExecAfter[id] = {
      stop: setInterval(function () {
        time--;
        buttons[
          exec.btn
        ].innerHTML = `${text} <span style="color:#ffffff94"> (${time})</span>`;
        if (time <= 0) {
          buttons[exec.btn].innerText = text;
          buttons[exec.btn].click();
          clearInterval(timeExecAfter[id].stop);
        }
      }, 1000),
      text: text,
      btn: buttons[exec.btn],
    };
  }

  function execAfterStop(id) {
    clearInterval(timeExecAfter[id].stop);
    timeExecAfter[id].btn.innerHTML = timeExecAfter[id].text;
  }

  (function onKeyDown() {
    document.addEventListener("keydown", (e) => {
      if (Object.keys(dialogs.dialogsOpen).length > 0) {
        let id = dialogs.dialogsOpen[
          Object.keys(dialogs.dialogsOpen)[
          Object.keys(dialogs.dialogsOpen).length - 1
          ]
        ].id;

        if (e.keyCode === 27) {
          if (dialogs.keyEsc[id]) {
            // onClose(id)

            // console.log(dialogs.onClose[id], id, dialogs.onClose);

            if (dialogs.onClose[id]) dialogs.onClose[id]();

            if (document.getElementById(id + "_Modal"))
              document.getElementById(id + "_Modal").remove();

            // console.log(document.getElementById(id));
            if (document.getElementById(id)) {
              document.getElementById(id).style.display = "none";
              document.getElementById(id).style.borderBottom;
            }

            if (dialogs.execAfter[id]) execAfterStop(id);

            delete dialogs.dialogsOpen[id];
            if (Object.keys(dialogs.dialogsOpen).length === 0) {
              document.querySelector('html').style.overflow = "";
            }
          }
          return false;
        }

        let ctrlKey = e.ctrlKey ? "CTRL+" : "";
        let shiftKey = e.shiftKey ? "SHIFT+" : "";
        let altKey = e.altKey ? "ALT+" : "";
        let key = ctrlKey + shiftKey + altKey + e.keyCode;

        if (dialogs.onKeyDown[id]) {
          try {
            console.log(dialogs.onKeyDown);

            if (dialogs.onKeyDown[id][key]) {
              dialogs.onKeyDown[id][key](e, 'xci');
              if (e.preventDefault) e.preventDefault();
              if (e.stopPropagation) e.stopPropagation();
              return false;
            }
          } catch (e) {
            return false;
          }
        }
      }
    });
  })();

  function dragEl(elem) {
    let offset = null;

    function outerElent(el) {
      let s = window.getComputedStyle(el);
      let outer = {
        width:
          el.clientWidth +
          parseInt(s.getPropertyValue("margin-left")) +
          parseInt(s.getPropertyValue("margin-right")) +
          parseInt(s.getPropertyValue("border-left")) +
          parseInt(s.getPropertyValue("border-right")),
        height:
          el.offsetHeight +
          parseInt(s.getPropertyValue("margin-bottom")) +
          parseInt(s.getPropertyValue("margin-top")),
      };
      return outer;
    }

    if (document.getElementById(elem.id).querySelector(".xModal-modal-head"))
      document
        .getElementById(elem.id)
        .querySelector(".xModal-modal-head")
        .addEventListener("mousedown", mouseDown);

    if (document.getElementById(elem.id).querySelector(".xModal-modal-head"))
      document
        .getElementById(elem.id)
        .querySelector(".xModal-modal-head")
        .addEventListener("touchstart", touchstart);

    function mouseDown(e) {
      let outer = outerElent(elem);
      offset = {
        x: e.pageX - elem.offsetLeft,
        y: e.pageY - elem.offsetTop,
        // w: window.innerWidth ,
        // h: window.innerHeight
        w: window.innerWidth - outer.width / 2,
        h: window.innerHeight - outer.height / 2,
        width: outer.width / 2,
        height: outer.height / 2,
      };

      document.addEventListener("mouseup", mouseUp);
      document.addEventListener("mousemove", mouseMove);
    }

    function mouseMove(e) {
      e.preventDefault();
      let top = e.pageY - offset.y;
      let left = e.pageX - offset.x;

      // if (offset.h > top)
      //   elem.style.top = top - offset.height > 0 ? `${top}px` : offset.height;

      // if (offset.w > left)
      //   elem.style.left = left - offset.width > 0 ? `${left}px` : offset.width;

      elem.style.top = top - offset.height > 0 ? `${top}px` : offset.height;
      elem.style.left = `${left}px`;
    }

    function mouseUp() {
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mousemove", mouseMove);
    }

    function touchstart(e) {
      offset = {
        x: e.changedTouches[0].pageX - elem.offsetLeft,
        y: e.changedTouches[0].pageY - elem.offsetTop,
      };

      document.addEventListener("touchend", touchend);
      document.addEventListener("touchmove", touchmove);
    }

    function touchmove(e) {
      let outer = outerElent(elem);
      let ww = window.innerWidth - outer.width / 2;
      let hh = window.innerHeight - outer.height / 2;
      let width = outer.width / 2;
      let height = outer.height / 2;
      let top = e.changedTouches[0].pageY - offset.y;
      let left = e.changedTouches[0].pageX - offset.x;
      if (hh > top) elem.style.top = top - height > 0 ? `${top}px` : height;
      if (ww > left) elem.style.left = left - width > 0 ? `${left}px` : width;
    }

    function touchend() {
      document.removeEventListener("touchend", touchend);
      document.removeEventListener("touchmove", touchmove);
    }
  }

  function validarParams(argDefault, params) {
    if (params.el == undefined) throw "The el property has not been informed.";

    if (params.el[0] !== "#" && params.el[0] !== ".")
      throw "The el property must start with '#' or '.'";

    if (params.width && isNaN(params.width))
      throw "The property width is not a number.";

    if (params.height && isNaN(params.height))
      throw "The property height is not a number.";

    if (params.theme && themes[params.theme] === undefined)
      throw (
        "The theme selected is not a theme valid. " +
        "Valid values (xModal-blue, xModal-dark, xModal-opacity, xModal-dark-square)"
      );

    if (params.left && isNaN(params.left))
      throw "The property left is not a number.";

    if (params.top && isNaN(params.top))
      throw "The property top is not a number.";

    if (
      params.fullScreen &&
      params.fullScreen !== true &&
      params.fullScreen !== false
    )
      throw "The property fullScreen is not a boolean.";

    if (
      params.closeBtn &&
      params.closeBtn !== true &&
      params.closeBtn !== false
    )
      throw "The property closeBtn is not a boolean.";

    if (params.esc && params.esc !== true && params.esc !== false)
      throw "The property esc is not a boolean.";

    if (params.modal && params.modal !== true && params.modal !== false)
      throw "The property modal is not a boolean.";

    if (
      params.titleDisplay &&
      params.titleDisplay !== true &&
      params.titleDisplay !== false
    )
      throw "The property titleDisplay is not a boolean.";

    if (params.onCreate && typeof params.onCreate !== "function")
      throw "The onCreate is not a function.";

    if (params.onOpen && typeof params.onOpen !== "function")
      throw "The onOpen is not a function.";

    if (params.onClose && typeof params.onClose !== "function")
      throw "The onClose is not a function.";

    if (params.onKeyDown && typeof params.onKeyDown !== "object")
      throw "The onKeyDown is not a object.";

    if (params.onKeyDown && Object.keys(params.onKeyDown).length === 0)
      throw "The onKeyDown is not a valid object.";

    if (params.onKeyDown)
      Object.keys(params.onKeyDown).map((key) => {
        if (typeof params.onKeyDown[key] !== "function")
          throw `The property ${key} from onKeyDown is not a function.`;
      });

    if (params.execAfter && typeof params.execAfter !== "object")
      throw "The execAfter is not a object.";

    if (
      params.execAfter &&
      (params.execAfter.time === undefined || isNaN(params.execAfter.time))
    )
      throw "The property time from execAfter is not valid.";

    if (params.execAfter && params.execAfter.btn === undefined)
      throw "The property btn from execAfter is not found.";

    if (params.execAfter && params.buttons[params.execAfter.btn] === undefined)
      throw `The button property '${params.execAfter.btn}' reported in execAfter was not found inside buttons.`;

    if (params.buttons && typeof params.buttons !== "object")
      throw "The buttons is not a object.";

    if (params.buttons && Object.keys(params.buttons).length === 0)
      throw "The buttons is not a valid object.";

    if (params.buttons)
      Object.keys(params.buttons).map((btn) => {
        if (typeof params.buttons[btn] !== "object")
          throw `The property '${btn}' from buttons is not a object.`;

        if (Object.keys(params.buttons[btn]).length === 0)
          throw `The property '${btn}' from buttons is not a valid object.`;

        Object.keys(params.buttons[btn]).map((key) => {
          if (btnProperty[key] === undefined)
            throw `The property '${key}' from button '${btn}' is not valid property. Valids property: 'html','class','click'`;
        });

        if (typeof params.buttons[btn].click !== "function")
          throw `The property click from button ${btn} is not a valid function or has not been informed`;
      });
  }

  function create(params: iModal) {
    const argDefault = {
      el: "",
      title: "&nbspMensagem do Sistema",
      buttons: false,
      onClose: false,
      onOpen: false,
      resize: false,
      onCreate: false,
      // // theme: "xModal-blue",
      width: window.innerWidth - (window.innerWidth * 25) / 100,
      height: window.innerHeight - (window.innerHeight * 25) / 100,
      fullScreen: false,
      closeBtn: true,
      hash: false,
      execAfter: false,
      esc: true,
      modal: true,
      titleDisplay: true,
      onKeyDown: {},
      top: "",
      left: "",
      // classForOpen: false,
      // classForClose: false,
    };

    validarParams(argDefault, params);

    let arg = Object.assign(argDefault, params);

    let ax = {
      header: <any>"",
      footer: <any>"",
      textHeader: <any>"",
      btnClose: "",
      element: <any>"",
      main: <any>"",
      idElement: "",
      eventoOpen: {},
      eventoClose: {},
      btnsFooter: {},
      dataOpen: <any>'',
      setMain(arg) {
        this.element = document.querySelector(arg.el);
        // console.log(this.element);
        let id = this.element.id;
        this.element.classList.add("xModal-modal-content");
        this.element.removeAttribute("id");
        this.element.style.display = "";

        if (this.element.getAttribute('title')) {
          arg.title = this.element.getAttribute('title');
          this.element.removeAttribute('title')
        }

        this.main = document.createElement("div");
        this.main.classList.add("xModal-modal-main");

        this.main.classList.add(arg.theme ? arg.theme : defaultTheme);

        this.main.classList.add(id + "_Modal");

        this.main.setAttribute("id", id);
        this.main.setAttribute("modal", arg.modal);

        this.main.style.height = `${arg.height}px`;
        this.main.style.width = `${arg.width}px`;
        this.main.style.display = "none";

        this.element.parentNode.insertBefore(this.main, this.element);
        this.idElement = id;
      },
      appendMain() {
        this.main.appendChild(this.element);
        this.element = this.main;
      },
      setHeader() {
        this.header = document.createElement("div");
        this.header.classList.add("xModal-modal-head");
      },
      setTextHeader(title) {
        this.textHeader = document.createElement("div");
        this.textHeader.innerHTML = title;
        this.header.appendChild(this.textHeader);
      },
      setFooter() {
        this.footer = document.createElement("div");
        this.footer.classList.add("xModal-modal-foot");
      },
      setBtnFooter(buttons) {
        for (let i in buttons) {
          let btn = document.createElement("button");
          btn.innerHTML = buttons[i].html;
          if (buttons[i].class) {
            let _class = buttons[i].class.split(" ");
            for (let i in _class) btn.classList.add(_class[i]);
            // btn.classList.add(buttons[i].class)
          }
          btn.classList.add("xModal-button-new");
          btn.addEventListener("click", (e) => {
            buttons[i].click(e, this.dataOpen)
          });

          this.btnsFooter[i] = btn;
          this.footer.appendChild(btn);
        }

        if (Object.keys(buttons).length > 0) {
          this.element.appendChild(this.footer);
          this.element.querySelector('.xModal-modal-content').style.borderBottomLeftRadius = '0'
          this.element.querySelector('.xModal-modal-content').style.borderBottomRightRadius = '0'
        }

      },
      setBtnClose() {
        this.btnClose = document.createElement("button");
        this.btnClose.classList.add("xModal-button-new");
        this.btnClose.classList.add("xModal-close");
        this.btnClose.classList.add("Close" + this.idElement);
        this.btnClose.innerHTML = "&times;";
      },
      setKeyDown(idElement, onKeyDown) {

        let keys = {};
        for (let i in onKeyDown) {
          // console.log(i, onKeyDown[i]);
          keys[String(i).toUpperCase()] = onKeyDown[i];
          dialogs.onKeyDown[idElement] = keys;
        }
      },

      onClose(id) {
        this.main.classList.add("this-close");

        setTimeout(() => {
          this.element.style.display = "none";
          this.main.classList.remove("this-close");

          if (arg.modal)
            document.getElementById(this.idElement + "_Modal").remove();

          if (this.eventoClose[id]) this.eventoClose[id]();

          if (dialogs.execAfter[id]) execAfterStop(id);

          delete dialogs.dialogsOpen[id];

          this.dataOpen = null

          if (Object.keys(dialogs.dialogsOpen).length === 0) {
            document.querySelector('html').style.overflow = "";
          }

        }, 100);

      },

      onOpen(data) {

        this.main.classList.add("this-open");
        setTimeout(() => {
          this.main.classList.remove("this-open");
        }, 100);

        if (!(this.idElement in dialogs.dialogsOpen)) {
          dialogs.dialogsOpen[this.idElement] = { id: this.idElement };

          var zindex = (Object.keys(dialogs.dialogsOpen).length * 2) + 1045;
          this.element.style.zIndex = zindex;
          document.querySelector('html').style.overflow = "hidden";

          if (arg.modal) {
            let overlay = <any>document.createElement("div");
            overlay.classList.add("xModal-widget-overlay");
            overlay.classList.add(arg.theme ? arg.theme : defaultTheme);
            overlay.style.zIndex = zindex - 1;
            overlay.setAttribute("id", this.idElement + "_Modal");
            // document.body.appendChild(overlay);
            document.getElementById(this.idElement).after(overlay)
          }

          this.element.style.display = "";

          if (this.idElement in this.eventoOpen) {
            this.eventoOpen[this.idElement](data);
            this.dataOpen = data
          }

          if (this.idElement in dialogs.execAfter)
            execAfterFunc(this.btnsFooter, this.idElement);


        }


      },

      fullScreen() {
        this.element.style.width = "100%";
        this.element.style.height = "100%";
        this.element.style.top = 0;
        this.element.style.left = 0;
        this.element.style.borderRadius = 0;
        this.element.style.maxHeight = "none";
        this.element.style.maxWidth = "none";
        this.element.style.transform = "none";
      },

      destroy() {
        delete this.eventoClose[this.idElement];
        delete this.eventoOpen[this.idElement];
        delete dialogs.onKeyDown[this.idElement];
        delete dialogs.keyEsc[this.idElement];

        this.element.removeAttribute("class");
        this.element.removeAttribute("modal");
        this.element.removeAttribute("style");
        this.element.style.display = "none";

        this.element.querySelector(".xModal-modal-head").remove();
        if (this.element.querySelector(".xModal-modal-foot"))
          this.element.querySelector(".xModal-modal-foot").remove();
        this.element
          .querySelector(".xModal-modal-content")
          .removeAttribute("class");

        // dialogs.created.splice(dialogs.created.indexOf(arg.el), 1)

        // if (arg.modal) {
        //     // console.log(this.idElement);
        //     //  document.getElementById(this.idElement + '_Modal').remove()
        //     //  this.element.remove()
        //     document.querySelector('html').style.overflow = ''

        // }
      },

      resize(topLeft, topRight, buttonLeft, buttonRight) {
        const conteinerDiv = document.createElement("div");

        let constCss = "";

        if (topLeft == true || topLeft == undefined) {
          const topLeftDiv = <any>document.createElement("div");
          topLeftDiv.classList.add("top-left", "resizer");
          topLeftDiv.style =
            "left: -3px;top: -3px;cursor: nwse-resize;" + constCss;
          topLeftDiv.style =
            "height: 0px;width: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;-webkit-transform: rotate(135deg);top: -1px;left: -5px;cursor: nwse-resize;" +
            constCss;
          conteinerDiv.appendChild(topLeftDiv);
        }

        if (topRight == true || topRight == undefined) {
          const topRightDiv = <any>document.createElement("div");
          topRightDiv.classList.add("top-right", "resizer");
          topRightDiv.style =
            "right: -3px;top: -3px;cursor: nesw-resize;" + constCss;
          topRightDiv.style =
            "height: 0px;width: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;-webkit-transform: rotate(-135deg);top: -1px;right: -5px;cursor: nesw-resize;" +
            constCss;
          conteinerDiv.appendChild(topRightDiv);
        }

        if (buttonLeft == true || buttonLeft == undefined) {
          const buttonLeftDiv = <any>document.createElement("div");
          buttonLeftDiv.classList.add("bottom-left", "resizer");
          // buttonLeftDiv.style = 'left: -3px;bottom: -3px;cursor: nesw-resize;' + constCss
          buttonLeftDiv.style =
            "height: 0px;width: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;-webkit-transform: rotate(45deg);bottom: 0px;left: -5px;cursor: nesw-resize;" +
            constCss;
          conteinerDiv.appendChild(buttonLeftDiv);
        }

        if (buttonRight == true || buttonRight == undefined) {
          const buttonRightDiv = <any>document.createElement("div");
          buttonRightDiv.classList.add("bottom-right", "resizer");
          // buttonRightDiv.style = 'right: -3px;bottom: -3px;cursor: nwse-resize;' + constCss
          buttonRightDiv.style =
            "height: 0px;width: 0px;border-left: 10px solid transparent;border-right: 10px solid transparent;-webkit-transform: rotate(-45deg);bottom: 0px;right: -5px;cursor: nwse-resize;" +
            constCss;
          conteinerDiv.appendChild(buttonRightDiv);
        }

        conteinerDiv.classList.add("resizers");
        this.element.appendChild(conteinerDiv);

        const resizers = conteinerDiv.querySelectorAll(".resizer");

        const minimum_size = 20;
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;

        for (let i = 0; i < resizers.length; i++) {
          resizers[i].addEventListener("mousedown", function (e: any) {
            e.preventDefault();
            original_width = parseFloat(
              getComputedStyle(ax.element, null)
                .getPropertyValue("width")
                .replace("px", "")
            );
            original_height = parseFloat(
              getComputedStyle(ax.element, null)
                .getPropertyValue("height")
                .replace("px", "")
            );
            original_x = ax.element.getBoundingClientRect().left;
            original_y = ax.element.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResize);
          });

          let resize = (e) => {
            if (resizers[i].classList.contains("bottom-right")) {
              const width = original_width + (e.pageX - original_mouse_x);
              const height = original_height + (e.pageY - original_mouse_y);
              if (width > minimum_size) ax.element.style.width = width + "px";
              if (height > minimum_size)
                ax.element.style.height = height + "px";
            } else if (resizers[i].classList.contains("bottom-left")) {
              const height = original_height + (e.pageY - original_mouse_y);
              const width = original_width - (e.pageX - original_mouse_x);
              if (height > minimum_size)
                ax.element.style.height = height + "px";
              if (width > minimum_size) {
                ax.element.style.width = width + "px";
                ax.element.style.left =
                  original_x + (e.pageX - original_mouse_x) + "px";
              }
            } else if (resizers[i].classList.contains("top-right")) {
              const width = original_width + (e.pageX - original_mouse_x);
              const height = original_height - (e.pageY - original_mouse_y);
              if (width > minimum_size) ax.element.style.width = width + "px";
              if (height > minimum_size) {
                ax.element.style.height = height + "px";
                ax.element.style.top =
                  original_y + (e.pageY - original_mouse_y) + "px";
              }
            } else {
              const width = original_width - (e.pageX - original_mouse_x);
              const height = original_height - (e.pageY - original_mouse_y);
              if (width > minimum_size) {
                ax.element.style.width = width + "px";
                ax.element.style.left =
                  original_x + (e.pageX - original_mouse_x) + "px";
              }
              if (height > minimum_size) {
                ax.element.style.height = height + "px";
                ax.element.style.top =
                  original_y + (e.pageY - original_mouse_y) + "px";
              }
            }
          };

          let stopResize = () => {
            window.removeEventListener("mousemove", resize);
          };
        }
      },
    };

    ax.setMain(arg);
    ax.setHeader();
    ax.setTextHeader(arg.title);
    ax.setBtnClose();

    // dialogs.created.push(arg.el)

    dialogs.keyEsc[ax.idElement] = arg.closeBtn;

    dialogs.keyEsc[ax.idElement] = arg.esc;

    if (arg.titleDisplay) ax.main.appendChild(ax.header);

    ax.appendMain();

    ax.setFooter();

    ax.setBtnFooter(arg.buttons);

    ax.setKeyDown(ax.idElement, arg.onKeyDown);

    if (arg.onOpen) ax.eventoOpen[ax.idElement] = arg.onOpen;

    if (arg.onClose) {
      ax.eventoClose[ax.idElement] = arg.onClose;
      dialogs.onClose[ax.idElement] = arg.onClose;
    }

    if (arg.titleDisplay)
      if (arg.closeBtn) {
        ax.header.appendChild(ax.btnClose);
        ax.element
          .querySelector(".Close" + ax.idElement)
          .addEventListener("click", () => ax.onClose(ax.idElement));
      }

    if (arg.fullScreen) ax.fullScreen();

    if (arg.top != "0") ax.element.style.top = `${arg.top}px`;

    if (arg.left != "0") ax.element.style.left = `${arg.left}px`;

    if (arg.onCreate) arg.onCreate();

    if (arg.execAfter) dialogs.execAfter[ax.idElement] = arg.execAfter;

    if (typeof arg.resize == "object") {
      //@ts-ignore
      let [topLeft, topRight, buttonLeft, buttonRight] = arg.resize;
      ax.resize(topLeft, topRight, buttonLeft, buttonRight);
    } else if (arg.resize) ax.resize(true, true, true, true);

    this.btnFocus = (nameBtn) => ax.btnsFooter[nameBtn].focus();

    this.btnDisable = (nameBtn) => (ax.btnsFooter[nameBtn].disabled = true);

    this.btnEnable = (nameBtn) => (ax.btnsFooter[nameBtn].disabled = false);

    this.btnClick = (nameBtn) => ax.btnsFooter[nameBtn].click();

    this.setTitle = (title) => (ax.textHeader.innerHTML = title);

    this.btnFooter = (nameBtn) => ax.btnsFooter[nameBtn];

    this.destroy = () => ax.destroy();

    this.open = (data) => ax.onOpen(data);

    this.close = () => ax.onClose(ax.idElement);

    dragEl(ax.element);
  }

  function changeTheme(_theme) {
    defaultTheme = _theme;
    let el = [...(<any>document.querySelectorAll(".xModal-modal-main"))];
    for (let i in el) {
      el[i].classList = "xModal-modal-main";
      el[i].classList.add(_theme);
    }
  }

  function setBlur() {
    let el = [...(<any>document.querySelectorAll(".xModal-modal-main"))];
    for (let i in el) {
      el[i].classList.add("blueMain");
      el[i].querySelector(".xModal-modal-head").classList.add("blurTitle");
      el[i].querySelector(".xModal-modal-content").classList.add("blurContent");
    }
    [
      ...(<any>(
        document
          .querySelector(".xModal-widget-overlay")
          .classList.add("blurOverlay")
      )),
    ];
  }

  return {
    create: create,
    dialogs: dialogs,
    countIsOpen: countIsOpen,
    setCss: setCss,
    setTheme: (_theme) => { defaultTheme = _theme; },
    changeTheme: changeTheme,
    setBlur: setBlur,
  };
})();
