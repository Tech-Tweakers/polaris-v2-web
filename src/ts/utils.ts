import xModal from "@/plugins/xModal/xModal";
import Swal from "sweetalert2";
import $ from 'jquery'

interface iShowModal {
  msg: string;
  title?: string | "Mensagem do Sistema";
  theme?:
  | "xModal-blue"
  | "xModal-opacity"
  | "xModal-dark"
  | "xModal-dark-square"
  | "xModal-bublue";
  onClose?: Function | false;
}
interface iConfirmaModal extends iShowModal {
  call: Function | false;
  cancel?: Function | false;
}
interface iAguardeModal {
  msg: string;
  title?: string | "Mensagem do Sistema";
  theme?:
  | "xModal-blue"
  | "xModal-opacity"
  | "xModal-dark"
  | "xModal-dark-square"
  | "xModal-bublue";
}

export const snakeCase = (text: string) => {
  return (
    text &&
    //@ts-ignore
    text
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join("_")
  );
};

export const validMail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const formatValor = (num: string | number, toFixed = 2): string => {

  if (!num) return "0,00";

  num = Number(num);

  return num
    .toFixed(toFixed)
    .replace(".", ",")
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
};

export const validaCPF_CNPJ = (CPF_CNPJ: string): boolean => {
  CPF_CNPJ = CPF_CNPJ.split('.').join('').split('-').join('').split('/').join('');
  let tamanho = CPF_CNPJ.length;

  switch (tamanho) {
    case 11:
      if (valida_cpf(CPF_CNPJ))
        return true;
      else
        return false;
    case 14:
      if (valida_cnpj(CPF_CNPJ))
        return true;
      else
        return false;
    default:
      return false;
  }


  function valida_cpf(cpf) {
    var cpf_farmatado;
    if (cpf.substring(3, 4) == '.') {
      cpf_farmatado = cpf.substring(0, 3);
      cpf_farmatado += cpf.substring(4, 7);
      cpf_farmatado += cpf.substring(8, 11);
      cpf_farmatado += cpf.substring(12, 14);
      cpf = cpf_farmatado;
    }
    var numeros, digitos, soma, i, resultado, digitos_iguais;
    digitos_iguais = 1;
    if (cpf.length < 11)
      return false;
    for (i = 0; i < cpf.length - 1; i++)
      if (cpf.charAt(i) != cpf.charAt(i + 1)) {
        digitos_iguais = 0;
        break;
      }
    if (!digitos_iguais) {
      numeros = cpf.substring(0, 9);
      digitos = cpf.substring(9);
      soma = 0;
      for (i = 10; i > 1; i--)
        soma += numeros.charAt(10 - i) * i;
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(0))
        return false;
      numeros = cpf.substring(0, 10);
      soma = 0;
      for (i = 11; i > 1; i--)
        soma += numeros.charAt(11 - i) * i;
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(1))
        return false;
      return true;
    } else
      return false;
  }

  function valida_cnpj(cnpj) {
    var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
    digitos_iguais = 1;
    if (cnpj.length < 14 && cnpj.length < 15)
      return false;
    for (i = 0; i < cnpj.length - 1; i++)
      if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
        digitos_iguais = 0;
        break;
      }
    if (!digitos_iguais) {
      tamanho = cnpj.length - 2
      numeros = cnpj.substring(0, tamanho);
      digitos = cnpj.substring(tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
          pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(0))
        return false;
      tamanho = tamanho + 1;
      numeros = cnpj.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
          pos = 9;
      }
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(1))
        return false;
      return true;
    } else
      return false;
  }

};

export const formatValorUSA = (num: string): number => {
  return parseFloat(num.replace(/\./g, "").replace(/\,/g, "."));
};

export const dataBrasil = (data: string): string => {
  let separador: any;
  if (data != null && data != "") {
    if (data.trim() === "") {
      return "";
    }
    if (data.search("-") > 0) {
      separador = "-";
    }
    if (data.search("/") > 0) {
      separador = "/";
    }
    if (data.search(".") > 0) {
      separador = ".";
    }

    if (data.length > 10) {
      data = data.substring(0, 10);
    }

    //2014/12/01
    let rt = data.split(separador);
    let dt = rt[2] + "/" + rt[1] + "/" + rt[0];
    return dt;
  } else {
    return "";
  }
};

export const dataUSA = (data) => {

  if (data.search('-') > 0) {
    var separador = '-';
  }
  if (data.search('/') > 0) {
    var separador = '/';
  }
  if (data.search('.') > 0) {
    var separador = '.';
  }

  var rt = data.split(separador);
  var dt = rt[2] + '/' + rt[1] + '/' + rt[0];
  return dt;
};

export const show = function (arg: iShowModal | string) {
  if (typeof arg == "string") {
    arg = {
      msg: arg,
      title: "Mensagem do Sistema",
      theme: "xModal-bublue",
      onClose: false,
    };
  } else {
    if (!arg.title) arg.title = "Mensagem do Sistema";
  }

  let id = "pnMsg" + Math.floor(Math.random() * 9999);
  let body = document.querySelector("body");
  let div = document.createElement("div");
  div.setAttribute("id", id);
  div.innerHTML = `<div style="height: 100%;display: flex;align-items: center;justify-content: center; font-weight: bold;">${arg.msg}</div>`;
  //@ts-ignore
  body.append(div);
  //@ts-ignore
  let modal = new xModal.create({
    el: "#" + id,
    theme: arg.theme,
    title: arg.title,
    width: 600,
    height: 230,
    onClose: function () {
      //@ts-ignore
      arg.onClose && arg.onClose();
      modal.destroy();
      //@ts-ignore
      document.querySelector("#" + id).remove();
    },
    onOpen: function () {
      modal.btnFocus("OK");
    },
    buttons: {
      OK: {
        html: "OK",
        click: () => {
          modal.close();
        },
      },
    },
  });

  modal.open();
};

export const confirmaCodigo = function (arg: iConfirmaModal) {
  if (!arg.title) arg.title = "Mensagem do Sistema";

  let numero = Math.floor(Math.random() * 999999);

  let id = "pnConKey" + Math.floor(Math.random() * 9999);
  let body = document.querySelector("body");
  let div = document.createElement("div");
  div.setAttribute("id", id);
  div.innerHTML = `<div style="height: 100%;display: flex;align-items: center;justify-content: center; font-weight: bold;
                         flex-direction: column; text-align: center;">${arg.msg}
                         <div id="pnCodigoNumero" style="margin-top: 6px;
                                                    border-radius: 6px;
                                                    text-align: center;
                                                    font-weight: bold;
                                                    border: 1px solid #00000036;
                                                    background: #00000024;
                                                    padding: 6px 6px;
                                                    width: 176px;">${numero}</div>
                    
                        <input type="text" style="border-left: 2px solid red; text-align: center; width: 172px;" id="edtCodigoConf"/>
    </div>`;

  body.append(div);

  let codigo = <HTMLInputElement>document.querySelector("#edtCodigoConf");
  let eventKeydown = (e) => {
    if (e.keyCode == 13) modal.btnFocus("OK");
  };
  codigo.addEventListener("keydown", eventKeydown);
  //@ts-ignore
  let modal = new xModal.create({
    el: "#" + id,
    theme: arg.theme,
    title: arg.title,
    width: 500,
    height: 280,
    onClose: function () {
      arg.onClose && arg.onClose();
      modal.destroy();
      document.querySelector("#" + id).remove();

      codigo.removeEventListener("keydown", eventKeydown);
    },
    onOpen: function () {
      codigo.focus();
    },
    buttons: {
      OK: {
        html: "OK",
        click: () => {
          if (parseInt(codigo.value) != numero) {
            show({
              msg: "Código Inválido",
              onClose: () => {
                codigo.select();
              },
            });
          } else {
            arg.call && arg.call();
            modal.close();
          }
        },
      },
      cancelar: {
        html: "Cancelar",
        click: () => {
          arg.cancel && arg.cancel();
          modal.close();
        },
      },
    },
  });

  modal.open();
};

export const confirma = function (arg: iConfirmaModal) {
  if (!arg.title) arg.title = "Mensagem do Sistema";

  let id = "pnCon" + Math.floor(Math.random() * 9999);
  let body = document.querySelector("body");
  let div = document.createElement("div");
  div.setAttribute("id", id);
  div.innerHTML = `<div style="height: 100%;display: flex;align-items: center;justify-content: center; 
                          font-weight: bold; text-align: center;">${arg.msg}</div>`;

  body.append(div);

  let modal = new xModal.create({
    el: "#" + id,
    theme: arg.theme,
    title: arg.title,
    width: 500,
    height: 250,
    onClose: function () {
      arg.onClose && arg.onClose();
      modal.destroy();
      document.querySelector("#" + id).remove();
    },
    onOpen: function () {
      modal.btnFocus("cancelar");
    },
    buttons: {
      OK: {
        html: "OK",
        click: () => {
          arg.call && arg.call();
          modal.close();
        },
      },
      cancelar: {
        html: "Cancelar",
        click: () => {
          arg.cancel && arg.cancel();
          modal.close();
        },
      },
    },
  });

  modal.open();
};

let pnAguarde = null;
export const aguarde = function (arg: iAguardeModal | string) {
  if (typeof arg == "string") {
    //@ts-ignore
    if (arg.toUpperCase() == "CLOSE") {
      console.log("aaa");
      pnAguarde.close();
      return false;
    }

    arg = {
      msg: arg,
      title: "Mensagem do Sistema",
      theme: "xModal-bublue",
    };
  } else {
    if (!arg.title) arg.title = "Mensagem do Sistema";
  }

  let id = "pnAguarde";
  let body = document.querySelector("body");
  let div = document.createElement("div");
  div.setAttribute("id", id);
  div.innerHTML = `<div style="height: 100%;display: flex;align-items: center;justify-content: center; 
                        font-weight: bold; text-align: center; flex-direction: column;">${arg.msg}
                        <div style="text-align: center; font-weight: bold;">
                        <svg class="spinner" viewBox="0 0 50 50">
                         <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                        </svg>
                        </div>`;

  body.append(div);

  // if (pnAguarde == null)
  //@ts-ignore
  pnAguarde = new xModal.create({
    el: "#" + id,
    theme: arg.theme,
    title: arg.title,
    closeBtn: false,
    esc: false,
    width: 380,
    height: 180,
    onClose: function () {
      //@ts-ignore
      pnAguarde.destroy();
      //@ts-ignore
      document.querySelector("#" + id).remove();
    },
  });

  pnAguarde.open();
};

export const block = function (data: string): string {
  let _0xf0cc = [
    "\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4A\x4B\x4C\x4D\x4E\x4F\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5A\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6A\x6B\x6C\x6D\x6E\x6F\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7A\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x2B\x2F\x3D",
    "",
    "\x63\x68\x61\x72\x43\x6F\x64\x65\x41\x74",
    "\x63\x68\x61\x72\x41\x74",
    "\x6C\x65\x6E\x67\x74\x68",
    "\x6A\x6F\x69\x6E",
    "\x73\x6C\x69\x63\x65",
    "\x3D\x3D\x3D",
  ];
  let b64 = _0xf0cc[0];
  let o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    ac = 0,
    enc = _0xf0cc[1],
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data = unescape(encodeURIComponent(data));
  do {
    //@ts-ignore
    o1 = data[_0xf0cc[2]](i++);
    //@ts-ignore
    o2 = data[_0xf0cc[2]](i++);
    //@ts-ignore
    o3 = data[_0xf0cc[2]](i++);
    bits = (o1 << 16) | (o2 << 8) | o3;
    h1 = (bits >> 18) & 0x3f;
    h2 = (bits >> 12) & 0x3f;
    h3 = (bits >> 6) & 0x3f;
    h4 = bits & 0x3f;
    tmp_arr[ac++] =
      //@ts-ignore
      b64[_0xf0cc[3]](h1) +
      //@ts-ignore
      b64[_0xf0cc[3]](h2) +
      //@ts-ignore
      b64[_0xf0cc[3]](h3) +
      //@ts-ignore
      b64[_0xf0cc[3]](h4);
    //@ts-ignore
  } while (i < data[_0xf0cc[4]]);
  //@ts-ignore
  enc = tmp_arr[_0xf0cc[5]](_0xf0cc[1]);
  //@ts-ignore
  let r = data[_0xf0cc[4]] % 3;
  //@ts-ignore
  return (r ? enc[_0xf0cc[6]](0, r - 3) : enc) + _0xf0cc[7][_0xf0cc[6]](r || 3);
};

export const unlock = (data: string) => {
  let b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    ac = 0,
    dec = "",
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data += "";
  do {
    // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));
    bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
    o1 = (bits >> 16) & 0xff;
    o2 = (bits >> 8) & 0xff;
    o3 = bits & 0xff;
    if (h3 === 64) {
      //@ts-ignore
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 === 64) {
      //@ts-ignore

      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      //@ts-ignore
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);
  dec = tmp_arr.join("");
  return decodeURIComponent(escape(dec.replace(/\0+$/, "")));
};

export const validaOBR = (elementFather = '') => {
  let toReturn = false;

  let el = $(".obr")

  if (elementFather != '')
    el = $(document).find(elementFather).find(".obr")

  el.each(function () {
    if ($(this).val() === '' || $(this).val() === '-1' || $(this).val() == null || $(this).val() == undefined) {
      var element = $(this);

      Swal.fire({
        icon: 'error',
        text: $(this).prev().html() + ' deve ser preenchido',
      }).then(() => {

        setTimeout(() => {
          element.focus();
        }, 300);

      })

      toReturn = true;
      return false;
    }
  });
  return toReturn;


};

export const formatarChaveNF = (ctx) => {
  if (ctx) {
    let reg = /(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})(\d{4})/
    let replacer = (match, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, offset, string) => {
      return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11,].join(' ');
    }
    return ctx.replace(reg, replacer)
  }
  return 'Nota fiscal não informada.'
}

export const base64_decode = (data) => {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = '',
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data += '';
  do {
    // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));
    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;
    if (h3 === 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 === 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);
  dec = tmp_arr.join('');
  return decodeURIComponent(escape(dec.replace(/\0+$/, '')));
};

export const base64_encode = function (data) {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data = unescape(encodeURIComponent(data));
  do {
    // pack three octets into four hexets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);
    bits = o1 << 16 | o2 << 8 | o3;
    h1 = bits >> 18 & 0x3f;
    h2 = bits >> 12 & 0x3f;
    h3 = bits >> 6 & 0x3f;
    h4 = bits & 0x3f;
    // use hexets to index into b64, and append result to encoded string
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);
  enc = tmp_arr.join('');
  var r = data.length % 3;
  return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
};

export const SomenteNumero = (e) => {
  var tecla = e.keyCode;
  if ((tecla > 47 && tecla < 58))
    return true;
  else {
    if (tecla == 8 || tecla == 0)
      return true;
    else
      return false;
  }
}

export default {
  validMail,
  formatValor,
  formatValorUSA,
  dataBrasil,
  aguarde,
  confirma,
  confirmaCodigo,
  show,
  block,
  unlock,
  validaOBR,
  formatarChaveNF,
  base64_decode,
  base64_encode,
  SomenteNumero,
};

export const sleep = async (timeMs: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeMs);
  })
}