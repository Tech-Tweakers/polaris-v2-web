export default (function () {

    const version = 2.3;
    const state = { save: 'save', insert: 'insert', update: 'update', select: 'select', cancel: 'cancel', delete: 'delete' }
    let notFound = 'Nada Localizado'
    let defaultTheme = 'x-grayV2'
    let printHead = '';

    function create(param) {

        let argDefault = {
            source: [],
            filter: {
                filterBegin: false, //quando true ele pesquisa igual a palavra
                fields: false,
                conditional: 'OR'
            },
            columns: {},
            onSelectLine: false,
            compare: {},
            heightLine: false,
            height: '100%',
            width: 'default',
            setfocus: false,
            multiSelect: false,
            render: {},
            theme: defaultTheme,
            query: {
                endScroll: 0.1,
                execute: false,
            },
            afterSearch: false,
            sideBySide: false,
            click: false,
            dblClick: false,
            enter: false,
            frame: false,
            vModel: false,
            complete: false,
            keyDown: false,
            count: false,
            title: true,
            keySelectUp: false,
            keySelectDown: false
        };

        param = Object.assign({}, param);

        param.filter = Object.assign(argDefault.filter, param.filter)
        param.query = Object.assign(argDefault.query, param.query)

        let ax = {
            arg: {
                multiSelect: false,
                keySelectUp: [],
                keySelectDown: [],
                source: [],
                query: null,
                sideBySide: null,
                columns: [],
                compare: {},

            },
            idElment: '',
            element: {},
            gridTitle: {},
            gridContent: {},
            elementSideBySide: {},
            widthAll: 0,
            columnsAutoCreate: [],
            tabindex: 0,
            page: 1,
            sourceSelect: false,
            indexSelect: 0,
            gridDisable: null,
            divLoad: null,
            controlScroll: true,
            paramQuery: false,
            buttonsFrame: {},
            messageDuplicity: '',
            listTabForEnter: false,
            filterControl: false,


            constructor() {

                this.element = this.arg.el.tagName == 'DIV' ? this.arg.el : document.querySelector(this.arg.el)
                this.idElment = this.element.id
                this.element.classList.add("xGridV2-main");
                this.element.classList.add(this.arg.theme ? this.arg.theme : defaultTheme);

                // let pxHeight = this.arg.height.toString().indexOf('%') > 0 ? '' : 'px'
                let pxHeight = this.arg.height.toString().indexOf('%') > 0 ? '' : this.arg.height.toString().indexOf('px') > 0 ? '' : 'px'
                let pxWidth = this.arg.width.toString().indexOf('%') > 0 ? '' : this.arg.width.toString().indexOf('px') > 0 ? '' : 'px'
                this.element.style.height = this.arg.height != '100%' ? this.arg.height + pxHeight : this.arg.height
                if (this.arg.width != 'default') this.element.style.width = this.arg.width + pxWidth

                this.element.appendChild(this.createTitle())
                this.element.appendChild(this.setContent())

                this.onKeyDown();

                // lê os fields do html
                if (this.arg.sideBySide) {
                    if (this.arg.sideBySide.el) {
                        this.listTabForEnter = [...document.querySelector(this.arg.sideBySide.el)
                            .querySelectorAll('input[name], select[name],button[name],textarea[name]')
                        ]
                        let qto = 0;
                        document.querySelectorAll(this.arg.sideBySide.el).forEach((el) => {
                            el.querySelectorAll('[name]').forEach((field) => {

                                if (this.elementSideBySide[field.name]) {
                                    if (field.nodeName == 'DIV')
                                        return
                                    if (qto == 0) {
                                        let _el_ = this.elementSideBySide[field.name]
                                        this.elementSideBySide[field.name] = []
                                        this.elementSideBySide[field.name].type = 'radio'
                                        this.elementSideBySide[field.name][qto] = _el_
                                    }
                                    qto++
                                    this.elementSideBySide[field.name][qto] = field
                                } else {
                                    this.elementSideBySide[field.name] = field
                                    this.tabToEnter(field.name)
                                }
                            })
                        })

                    }
                    this.frame()
                    this.duplicity()
                    this.tabToEnter()
                }

                if (this.arg.complete)
                    this.arg.complete()


            },

            createTitle() {
                this.gridTitle = document.createElement("div")
                this.gridTitle.classList.add('xGridV2-title')
                this.gridTitle.classList.add('xGridV2-row')

                if (Object.keys(this.arg.columns).length > 0) {
                    this.checkWidthColumns();
                    this.widthAll = Object.values(this.arg.columns).reduce((total, b) => total + parseInt(b.width), 0);
                    this.setColumnsTitle(this.arg.columns);
                } else
                    this.setColumnsTitle({ '-': { dataField: '-', width: '100%' } });

                return this.gridTitle;
            },

            setTitle(source) {

                if (Object.keys(this.arg.columns).length == 0) {
                    while (this.gridTitle.firstChild) this.gridTitle.removeChild(this.gridTitle.firstChild)
                    this.columnsAutoCreate = [];
                    this.autoColumns(source)
                    this.widthAll = Object.values(this.columnsAutoCreate).reduce((total, b) => total + parseInt(b.width), 0);
                    this.setColumnsTitle(this.columnsAutoCreate);
                }

            },

            setColumnsTitle(columns) {

                if (this.arg.title == false)
                    return

                for (let id in columns) {
                    let col = document.createElement("div")
                    let label = document.createElement("label")
                    let span = document.createElement("span")
                    let resize = document.createElement("div")
                    resize.classList.add('siz')

                    col.setAttribute('name', columns[id].dataField)
                    col.classList.add('xGridV2-col')
                    col.style.width = columns[id].width

                    if (columns[id].dataField == '_count_')
                        span.innerHTML = '&nbsp;'
                    else
                        if (this.widthAll > 100)
                            span.innerHTML = columns[id].dataField
                        else
                            span.innerHTML = id

                    col.appendChild(span)
                    col.appendChild(resize)
                    col.appendChild(label)

                    this.gridTitle.appendChild(col)

                    col.addEventListener('click', () => { this.orderByGrid(columns[id].dataField, col) })

                    this.resizeTitle(resize)
                }

                if (this.widthAll > 100)
                    this.gridTitle.lastChild.style.marginRight = '0px'
                // this.gridTitle.lastChild.style.paddingRight = '3px'

                this.orderByGrid();

            },

            setContent() {
                this.gridContent = document.createElement("div")
                this.gridContent.classList.add('xGridV2-content')

                // this.gridContent.style.width = `${this.widthAll}%`

                if (this.arg.query.execute)
                    this.gridContent.addEventListener('scroll', this.eventListenerScroll)

                if (this.arg.dblClick)
                    this.gridContent.addEventListener('dblclick', () => {
                        this.arg.dblClick(this.sourceSelect);
                    })

                if (this.arg.click)
                    this.gridContent.addEventListener('click', () => {
                        this.arg.click(this.sourceSelect);
                    })


                return this.gridContent;
            },

            source(source) {

                this.onEvent.removeEventListenerAndRemoveElement()

                // while (this.gridContent.firstChild) this.gridContent.removeChild(this.gridContent.firstChild)

                if (this.filterControl == false)
                    this.arg.source = [];

                this.setTitle(source)

                this.tabindex = 0
                this.indexSelect = 0
                this.page = 1
                this.sourceSelect = false
                this.gridContent.scrollTop = 0

                this.createLine(source)

                if (this.widthAll > 100) {
                    this.element.style.overflow = 'auto'
                    this.element.scrollTop = 0
                    this.element.scrollLeft = 0
                    this.gridContent.style.overflowY = 'unset';
                    this.gridContent.style.width = `${this.widthAll}%`
                    this.gridTitle.style.width = `${this.widthAll}%`
                    if (this.arg.query.execute)
                        this.element.addEventListener('scroll', this.eventListenerScroll)
                }

                if (this.arg.setfocus)
                    this.focus(this.arg.setfocus - 1)

            },

            checkWidthColumns() {
                let valPercente = 0;
                let qtoColumn = 0;

                if (this.arg.count) {
                    let obj = {};
                    obj['_count_'] = { dataField: '_count_', width: '4%' }
                    this.arg.columns = Object.assign(obj, this.arg.columns)
                }


                for (let i in this.arg.columns) {
                    // if (this.arg.count)
                    //     this.arg.columns.push({ dataField: '_count_', width: '4%' });

                    // console.log(this.arg.columns);
                    if (this.arg.columns[i].width == undefined)
                        qtoColumn++;
                    let wd = this.arg.columns[i].width != undefined ? parseInt(this.arg.columns[i].width) : 0;
                    valPercente += wd;
                    // console.log(valPercente);
                }

                if (qtoColumn != 0)
                    for (let i in this.arg.columns) {
                        if (this.arg.columns[i].width == undefined)
                            // this.arg.columns[i].width = ((100 - valPercente) / qtoColumn).toFixed(2) + '%';
                            this.arg.columns[i].width = ((100 - valPercente) / qtoColumn) + '%';
                    }

            },

            autoColumns(source) {
                if (this.arg.count)
                    this.columnsAutoCreate.push({ dataField: '_count_', width: '4%' });

                if (source[0] != undefined) {
                    let wid = 100 / Object.keys(source[0]).length;
                    for (let i in source[0]) {
                        let lengthString = source[0][i].length == undefined ? wid : (source[0][i].trim().length * 85 / 100)
                        // wid = wid < 15 ? 20 : wid
                        // lengthString = lengthString * 85/100  
                        this.columnsAutoCreate.push({ dataField: i, width: lengthString + '%' });
                    }
                }

            },

            setCompare(col, source) {

                if (col.compare) {
                    let _source = { ...source }
                    // source.value = source[col.dataField]
                    _source.value = _source[col.dataField]
                    let value = this.arg.compare[col.compare](_source)

                    if (value == undefined)
                        return false
                    else
                        //    return this.arg.compare[col.compare](_source)
                        return value
                }
            },

            createLine(source, order) {
                if (order == undefined)
                    order = 'BOTTOM'

                let col;
                if (Object.keys(this.arg.columns).length > 0)
                    col = this.arg.columns
                else
                    col = this.columnsAutoCreate

                for (let i in source) {
                    this.arg.source[this.tabindex] = source[i]

                    let div = document.createElement('div');
                    div.classList.add('xGridV2-row')

                    if (this.arg.heightLine)
                        div.style.height = `${this.arg.heightLine}px`

                    div.setAttribute('tabindex', this.tabindex)
                    this.tabindex++

                    if (this.arg.count)
                        source[i]._count_ = this.tabindex

                    for (let c in col) {
                        let divCol = document.createElement('div')
                        // let span = document.createElement('span')
                        let value = source[i][col[c].dataField]
                        let compare = this.setCompare(col[c], source[i])

                        if (compare) value = compare

                        if (col[c].render) value = col[c].render(value)

                        value = this.elementSpanConfig(col[c], value)

                        if (this.arg.count)
                            if (col[c].dataField == '_count_')
                                value = `<span style="width:100%;text-align: center;opacity: 0.5;">${value}</span>`

                        divCol.classList.add('xGridV2-col')
                        divCol.style.width = col[c].width
                        divCol.setAttribute('name', col[c].dataField)
                        divCol.innerHTML = value
                        div.appendChild(divCol)
                    }


                    if (order.toUpperCase() == 'TOP')
                        this.gridContent.insertBefore(div, this.gridContent.firstChild)

                    if (order.toUpperCase() == 'BOTTOM')
                        this.gridContent.appendChild(div)

                    this.onEvent.setEventListener(div)

                    if (this.arg.count)
                        delete source[i]._count_

                }


                if (Object.keys(source).length > 0) {
                    this.controlScroll = true
                    if (this.gridContent.querySelector('nav'))
                        this.gridContent.querySelector('nav').remove()
                } else
                    if (this.arg.query.execute == false)
                        if (!this.gridContent.querySelector('nav')) {
                            let nav = document.createElement('nav')
                            nav.innerHTML = notFound
                            this.gridContent.appendChild(nav)
                        }


                this.closeLoad()
                this.loadMore(false)
            },
            setaForUp(e) {
                if (ax.widthAll <= 100) {
                    if (ax.gridContent.scrollTop > 0)
                        ax.gridContent.scrollTop = ax.gridContent.scrollTop - 1;
                } else {
                    let scroll = ax.element.scrollTop
                    if (scroll > 0) {
                        let rowHeight = e.target.offsetHeight
                        ax.element.scrollTop = (scroll - rowHeight);
                    }
                }

                if (e.target.previousSibling)
                    e.target.previousSibling.focus()

                if (e.preventDefault)
                    e.preventDefault();
                if (e.stopPropagation)
                    e.stopPropagation();
            },

            setaForDown(e) {
                if (ax.widthAll <= 100)
                    ax.gridContent.scrollTop = ax.gridContent.scrollTop + 1
                else
                    ax.element.scrollTop = ax.element.scrollTop + 1

                if (e.target.nextSibling)
                    e.target.nextSibling.focus()

                e.preventDefault();
                e.stopPropagation();
            },
            onEvent: {
                _control: false,
                divDisable: [],
                keyup(e) {
                    if (ax.arg.multiSelect)
                        if (e.keyCode == 17) {
                            ax.onEvent._control = false
                        }
                },
                keydown(e) {
                    // seta para cima
                    if (e.keyCode == 38)
                        ax.setaForUp(e)

                    // seta para cima por parametros
                    if (ax.arg.keySelectUp) {
                        if (typeof ax.arg.keySelectUp == 'object') {
                            ax.arg.keySelectUp.forEach(ln => {
                                if (e.keyCode == ln)
                                    ax.setaForUp(e)
                            })
                        } else {
                            if (e.keyCode == ax.arg.keySelectUp)
                                ax.setaForUp(e)
                        }
                    }

                    // seta para baixo
                    if (e.keyCode == 40)
                        ax.setaForDown(e)

                    // seta para baixo por parametros
                    if (ax.arg.keySelectDown) {
                        if (typeof ax.arg.keySelectDown == 'object') {
                            ax.arg.keySelectDown.forEach(ln => {
                                if (e.keyCode == ln)
                                    ax.setaForDown(e)
                            })
                        } else {
                            if (e.keyCode == ax.arg.keySelectDown)
                                ax.setaForDown(e)
                        }
                    }

                    // page up
                    if (e.keyCode == 33) {

                        try {
                            e.target.previousSibling.previousSibling.previousSibling.previousSibling.focus()
                        } catch (error) { return }

                        if (e.preventDefault)
                            e.preventDefault();
                        if (e.stopPropagation)
                            e.stopPropagation();
                    }

                    // page Down
                    if (e.keyCode == 34) {
                        try {
                            e.target.nextSibling.nextSibling.nextSibling.nextSibling.focus()
                        } catch (error) { return }

                        if (e.preventDefault)
                            e.preventDefault();
                        if (e.stopPropagation)
                            e.stopPropagation();
                    }

                    // key and last line
                    if (e.keyCode == 35) {
                        //@ts-ignore
                        ax.gridContent.querySelector('[tabindex="' + (ax.tabindex - 1) + '"]').focus()
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    // key home 1ª line
                    if (e.keyCode == 36) {
                        //@ts-ignore
                        ax.gridContent.querySelector('[tabindex="0"]').focus()
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    // control pressionado
                    if (ax.arg.multiSelect)
                        if (e.keyCode == 17)
                            ax.onEvent._control = true

                },
                focusin(e) {

                    // let el = ax.element.querySelector('.xGridV2-content');
                    let el = ax.gridContent
                    let select = el.querySelectorAll('.xGridV2-Selected')
                    let selectOut = el.querySelectorAll('.xGridV2-SelectedFocusOut')

                    if (ax.onEvent._control == false) {
                        select.forEach(r => r.classList.remove("xGridV2-Selected"))
                        selectOut.forEach(r => r.classList.remove("xGridV2-SelectedFocusOut"))

                        ax.indexSelect = e.currentTarget.getAttribute('tabindex')
                        ax.sourceSelect = ax.arg.source[ax.indexSelect]

                        ax.setElementSideBySide()

                    } else {
                        ax.indexSelect = e.currentTarget.getAttribute('tabindex')
                        ax.sourceSelect[ax.indexSelect] = ax.arg.source[ax.indexSelect]
                    }

                    e.target.classList.add('xGridV2-Selected')

                    ax.onSelectLine()



                },
                focusout() {
                    if (ax.onEvent._control == false) {
                        let select = ax.gridContent.querySelectorAll('.xGridV2-Selected')
                        select.forEach((r) => {
                            r.classList.remove("xGridV2-Selected");
                            r.classList.add("xGridV2-SelectedFocusOut");
                        })
                    }
                },
                setEventListener(el) {
                    el.addEventListener('focusin', this.focusin)
                    el.addEventListener('keydown', this.keydown)
                    el.addEventListener('focusout', this.focusout)
                    el.addEventListener('keyup', this.keyup)
                },
                removeEventListenerAndRemoveElement() {
                    Object.values(ax.gridContent.querySelectorAll('.xGridV2-row')).map((el) => {
                        el.removeEventListener('focusin', this.focusin)
                        el.removeEventListener('keydown', this.keydown)
                        el.removeEventListener('focusout', this.focusout)
                        el.removeEventListener('keyup', this.keyup)
                        el.remove()
                    })
                },
                removeEventListener() {
                    Object.values(ax.gridContent.querySelectorAll('.xGridV2-row')).map((el) => {
                        el.removeEventListener('focusin', this.focusin)
                        el.removeEventListener('keydown', this.keydown)
                        el.removeEventListener('focusout', this.focusout)
                        el.removeEventListener('keyup', this.keyup)
                    })
                },
                removeEventListenerElement(el) {
                    el.removeEventListener('focusin', this.focusin)
                    el.removeEventListener('keydown', this.keydown)
                    el.removeEventListener('focusout', this.focusout)
                    el.removeEventListener('keyup', this.keyup)
                },
                setEventListenerAll() {
                    this.removeEventListener();
                    Object.values(ax.gridContent.querySelectorAll('.xGridV2-row')).map((el) => {
                        el.addEventListener('focusin', this.focusin)
                        el.addEventListener('keydown', this.keydown)
                        el.addEventListener('focusout', this.focusout)
                        el.addEventListener('keyup', this.keyup)
                    })
                }
            },

            elementSpanConfig(col, value) {
                let span = document.createElement('span')
                if (col.style || col.class || col.center || col.right) {
                    //@ts-ignore
                    if (col.style) span.style = col.style
                    span.style.width = '100%'
                    if (col.class) col.class.split(' ').forEach((e) => span.classList.add(e))
                    if (col.center) span.style.textAlign = 'center'
                    if (col.right) span.style.textAlign = 'right'
                    span.innerHTML = value
                    return span.outerHTML
                }

                return value
            },

            dataSource(field, value) {

                // console.log(field);

                if (typeof field == 'string') {

                    if (field != undefined && value != undefined) {
                        let cell = this.gridContent.querySelector('[tabindex="' + this.indexSelect + '"]').querySelector('[name="' + field + '"]')
                        let columns = Object.keys(this.arg.columns).length > 0 ? this.arg.columns : this.columnsAutoCreate;

                        // console.log(columns);

                        for (let i in columns) {

                            // console.log(ax.sourceSelect[field]);

                            // if (ax.sourceSelect[field]) {
                            //     console.log(ax.sourceSelect, field, value);

                            // }


                            if (columns[i].dataField == field) {
                                //  let span = document.createElement('span')

                                ax.sourceSelect[field] = value;


                                let compare = this.setCompare(columns[i], ax.sourceSelect)
                                if (compare) value = compare

                                if (columns[i].render != undefined)
                                    value = columns[i].render(value)

                                value = this.elementSpanConfig(columns[i], value)
                            }
                        }

                        // console.log(cell);

                        cell.innerHTML = value
                    }
                    /*get o valor do field solicitado*/
                    if (field != undefined && value == undefined)
                        return ax.sourceSelect[field];
                }

                if (typeof field == 'object' && Object.keys(field).length > 0) {

                    // console.log('sdfasdf');

                    let columns = Object.keys(this.arg.columns).length > 0 ? this.arg.columns : this.columnsAutoCreate;
                    let linha = this.gridContent.querySelector('[tabindex="' + this.indexSelect + '"]')
                    let cell;
                    for (let x in field) {
                        let _field = x
                        let _value = field[x]
                        cell = linha.querySelector('[name="' + _field + '"]')

                        if (ax.sourceSelect[_field] != undefined)
                            ax.sourceSelect[_field] = _value;

                        // console.log(ax.sourceSelect);

                        for (let i in columns) {
                            if (columns[i].dataField == _field) {


                                let compare = this.setCompare(columns[i], ax.sourceSelect)
                                if (compare) _value = compare


                                if (columns[i].render != undefined)
                                    _value = columns[i].render(_value)

                                _value = this.elementSpanConfig(columns[i], _value)

                            }
                        }
                        if (cell && cell.innerHTML)
                            cell.innerHTML = _value
                        if (cell && cell.value)
                            cell.value = _value
                    }
                }

                if (typeof field == 'object' && Object.keys(field).length == 0) {
                    let columns = Object.keys(this.arg.columns).length > 0 ? this.arg.columns : this.columnsAutoCreate;

                    for (let i in columns) {
                        // console.log();
                        if (typeof ax.sourceSelect[columns[i].dataField] == 'string')
                            ax.sourceSelect[columns[i].dataField] = '';
                    }
                }

                return ax.sourceSelect

            },
            eventListenerScroll(e) {
                let target = e.currentTarget
                let h = target.scrollHeight - (target.scrollHeight * ax.arg.query.endScroll)

                if (ax.controlScroll)
                    if ((target.offsetHeight + target.scrollTop >= h)) {
                        ax.loadMore()
                        ax.page++;
                        ax.arg.query.execute({ offset: ax.tabindex, page: ax.page, param: ax.paramQuery })
                        ax.controlScroll = false
                    }
            },
            focus(numLine) {

                if (this.gridDisable)
                    return false

                if (Object.keys(this.arg.source).length == 0)
                    return false

                if (Object.keys(this.sourceSelect).length > 0) {
                    if (numLine == undefined) {
                        this.gridContent.querySelector('[tabindex="' + this.indexSelect + '"]').focus()

                    } else {
                        let el = this.gridContent.querySelector('[tabindex="' + numLine + '"]')
                        if (el) el.focus()
                    }
                } else {
                    if (numLine == undefined) {
                        this.gridContent.querySelector('[tabindex="0"]').focus()
                    } else {
                        let el = this.gridContent.querySelector('[tabindex="' + numLine + '"]')
                        if (el) el.focus()
                    }

                }

            },
            disable(call) {
                this.onEvent.divDisable[0] = document.createElement('div')
                // this.onEvent.divDisable[1] = document.createElement('div')
                this.onEvent.divDisable[0].classList.add('xGridV2-disable')
                // this.onEvent.divDisable[1].classList.add('xGridV2-disable')

                this.onEvent.removeEventListener()

                if (this.widthAll > 100)
                    this.element.style.overflow = 'hidden'

                // this.gridContent.insertBefore(this.onEvent.divDisable[0], this.gridContent.firstChild)
                // this.gridTitle.insertBefore(this.onEvent.divDisable[1], this.gridTitle.firstChild)

                this.element.insertBefore(this.onEvent.divDisable[0], this.element.firstChild)

                this.gridDisable = true

                call && call()

            },
            enable(call) {
                if (this.onEvent.divDisable[0]) {
                    this.onEvent.divDisable[0].remove()
                    // this.onEvent.divDisable[1].remove()

                    this.onEvent.setEventListenerAll()

                    if (this.widthAll > 100)
                        this.element.style.overflow = 'auto'

                    this.gridDisable = false

                    call && call()
                }
            },
            clear(call) {
                this.onEvent.removeEventListenerAndRemoveElement()
                call && call()
            },
            loadMore(open = true) {
                if (open) {
                    this.divLoadMore = document.createElement('div')
                    this.divLoadMore.classList.add('xGridV2-load-search')
                    this.divLoadMore.innerHTML = '<i class="fa fa-spinner fa-pulse fa-fw fa-lg"></i> Carregando'

                    this.element.insertBefore(this.divLoadMore, this.element.firstChild)
                } else {
                    if (this.divLoadMore)
                        this.divLoadMore.remove()
                }
            },
            load(text, call) {

                if (text == undefined)
                    text = 'Carregando . . .';
                this.divLoad = document.createElement('div')
                this.divLoad.classList.add('xGridV2-load')
                this.divLoad.innerHTML = '<i class="fa fa-spinner fa-pulse fa-fw fa-lg"></i> ' + text;

                this.element.insertBefore(this.divLoad, this.element.firstChild)

                call && call()
            },
            closeLoad(call) {
                if (this.divLoad)
                    this.divLoad.remove()
                call && call()
            },
            getIndex() {
                return this.indexSelect
            },
            deleteLine(index) {

                // forDeleteSearch = true;

                index = index == undefined ? this.indexSelect : index;

                if (!index)
                    return

                let del = this.arg.source[index]
                delete this.arg.source[index];
                //  let indexOld = index;
                let target = this.gridContent.querySelector('[tabindex="' + index + '"]');

                if (target.nextSibling)
                    target.nextSibling.focus()
                else
                    if (target.previousSibling)
                        target.previousSibling.focus()

                this.onEvent.removeEventListenerElement(target)

                target.classList.add('xGridV2-deleteLine');
                setTimeout(() => {
                    target.remove()
                }, 500);


                // if (element.find('.xGridV2-content .xGridV2-row').length == 1)
                //     if (arg.sideBySide != false)
                //         clearDataSource();

                return del;
            },
            insertLine(param, order, call) {

                if (param[0] == undefined) {
                    param = [param];
                }

                this.createLine(param, order)

                this.focus(this.tabindex - 1)

                if (call != undefined)
                    call();

                return param;

            },
            sumDataField(dataField) {
                return Object.values(this.arg.source).reduce((sum, field) => sum + parseFloat(field[dataField]), 0);
            },
            onKeyDown() {
                this.element.addEventListener('keydown', (e) => {

                    let ctrlKey = e.ctrlKey ? "ctrl+" : "";
                    let shiftKey = e.shiftKey ? "shift+" : "";
                    let altKey = e.altKey ? "alt+" : "";
                    let key = ctrlKey + shiftKey + altKey + e.keyCode;

                    //@ts-ignore
                    if (key == 13) {
                        if (this.arg.enter) {
                            this.arg.enter(this.sourceSelect, e)
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }

                    if (this.arg.onKeyDown)
                        if (this.arg.onKeyDown[key]) {
                            this.arg.onKeyDown[key](this.sourceSelect, e)
                            e.preventDefault();
                            e.stopPropagation();
                        }
                })
            },
            onSelectLine() {
                this.vModel()
                if (this.arg.onSelectLine)
                    this.arg.onSelectLine(this.sourceSelect)
            },
            getElementSideBySideJson(toUpperCase = false, empty = true) {
                let date_regex = /^[0-3]?[0-9][- /.][0-3]?[0-9][- /.](?:[0-9]{2})?[0-9]{2}$/;
                let json = {}

                // console.log(this.elementSideBySide);

                for (let name in this.elementSideBySide) {

                    let value = this.elementSideBySide[name].value
                    let type = this.elementSideBySide[name].type

                    if (type == undefined)
                        if (this.elementSideBySide[name].localName == 'img')
                            continue

                    if (type == '')
                        if (this.elementSideBySide[name].localName == 'a')
                            continue

                    if (empty)
                        if (value == '')
                            continue

                    /*se o conteudo da variável for numérico ele retorna false*/
                    /*para igualar os valores no edit esta 1,00 no sourceSelect esta 1.00*/
                    if (!isNaN(parseFloat(value))) {
                        if (value.indexOf(",") > -1) {
                            value = parseFloat(value.replace(/\./g, '').replace(/\,/g, '.'));
                        }
                    }

                    /*tratamento para data*/
                    if (date_regex.test(value))
                        value = value.split(/[- /.]/).reverse().join('-').trim()

                    if (typeof value == 'string')
                        value = toUpperCase ? value.toUpperCase().trim() : value.trim();


                    if (type == 'checkbox')
                        value = this.elementSideBySide[name].checked ? '1' : '0';

                    if (type == 'radio') {
                        for (let r in this.elementSideBySide[name]) {
                            if (this.elementSideBySide[name][r].checked) {
                                value = this.elementSideBySide[name][r].value
                                break
                            }
                        }
                    }

                    json[name] = value

                }

                return json
            },
            setElementSideBySide() {
                if (this.arg.sideBySide) {

                    if (this.arg.sideBySide.el)
                        if (!this.arg.sideBySide.vModel)
                            for (let i in this.elementSideBySide) {

                                let value = this.sourceSelect[i];
                                let type = this.elementSideBySide[i].type

                                if (this.arg.sideBySide.render)
                                    if (this.arg.sideBySide.render[i])
                                        try {
                                            value = this.arg.sideBySide.render[i](value)
                                        } catch (error) { throw 'erro see your function render' }

                                if (this.arg.sideBySide.compare)
                                    if (this.arg.compare[this.arg.sideBySide.compare[i]])
                                        try {
                                            let _source = { ...this.sourceSelect }
                                            _source.value = value
                                            value = this.arg.compare[this.arg.sideBySide.compare[i]](_source)
                                        } catch (error) { throw 'erro see your function compare' }


                                switch (type) {
                                    case undefined:
                                        var typeEle = this.elementSideBySide[i].localName;
                                        if (typeEle == 'img') {
                                            this.elementSideBySide[i].src = value
                                        } else
                                            this.elementSideBySide[i].innerHTML = value
                                        break;
                                    case 'text':
                                    case 'password':
                                    case 'textarea':
                                    case 'number':
                                    case 'tel':
                                    case 'date':
                                    case 'time':
                                    case 'range':
                                    case 'hidden':
                                        ax.elementSideBySide[i].value = value
                                        break;
                                    case 'radio':
                                        // eslint-disable-next-line no-case-declarations
                                        let radios = { ...ax.elementSideBySide[i] }
                                        delete radios.type
                                        for (let r in radios) {
                                            if (radios[r].value == value) {
                                                radios[r].checked = true
                                                break
                                            }
                                        }
                                        break;
                                    case 'select-one':
                                        ax.elementSideBySide[i].value = value
                                        break;
                                    case 'checkbox':
                                        ax.elementSideBySide[i].checked = (value == '1' ? true : false)
                                        break;
                                    case '':
                                        { //href
                                            ax.elementSideBySide[i].href = value
                                            ax.elementSideBySide[i].innerHTML = value
                                            break;
                                        }
                                }
                            }
                }
            },
            getDiffTwoJson(toUpperCase = false, empty = true) {
                let diff = { old: {}, new: {}, diff: true }
                let fieldsSideBySide = this.getElementSideBySideJson(toUpperCase, empty)

                for (let i in fieldsSideBySide) {
                    if (fieldsSideBySide[i] != this.sourceSelect[i]) {
                        diff.old[i] = this.sourceSelect[i]
                        diff.new[i] = fieldsSideBySide[i];
                    }
                }

                if (Object.keys(diff.new).length == 0 && Object.keys(diff.old).length == 0)
                    diff.diff = false


                return diff

            },
            clearElementSideBySide() {
                ax.dataSource({})
                if (this.arg.sideBySide)
                    if (this.arg.sideBySide.el)
                        for (let i in this.elementSideBySide) {
                            let type = this.elementSideBySide[i].type

                            switch (type) {
                                case undefined:
                                    var typeEle = this.elementSideBySide[i].localName;
                                    if (typeEle == 'img') {
                                        this.elementSideBySide[i].src = ''
                                    } else
                                        this.elementSideBySide[i].innerHTML = ''
                                    break;
                                case 'text':
                                case 'password':
                                case 'textarea':
                                case 'number':
                                case 'tel':
                                case 'date':
                                case 'time':
                                case 'range':
                                case 'hidden':
                                    ax.elementSideBySide[i].value = ''
                                    break;
                                case 'radio':
                                    // eslint-disable-next-line no-case-declarations
                                    let radios = { ...ax.elementSideBySide[i] }
                                    delete radios.type
                                    for (let r in radios) {
                                        radios[r].checked = false
                                        break
                                    }
                                    break;
                                case 'select-one':
                                    ax.elementSideBySide[i].value = ''
                                    break;
                                case 'checkbox':
                                    ax.elementSideBySide[i].checked = false
                                    break;
                                case '':
                                    { //href
                                        ax.elementSideBySide[i].href = ''
                                        ax.elementSideBySide[i].innerHTML = ''
                                        break;
                                    }
                            }
                        }
            },
            querySourceAdd(source) {
                if (this.tabindex == 0)
                    this.source(source)
                else
                    this.createLine(source)
            },
            async queryOpen(param, call) {
                this.paramQuery = param
                this.tabindex = 0
                await this.arg.query.execute({ offset: this.tabindex, page: ax.page, param: param })
                call && call()
            },
            frame() {
                let btns = {}
                if (this.arg.sideBySide.frame)
                    if (this.arg.sideBySide.frame.el) {
                        let elFrame = document.querySelector(this.arg.sideBySide.frame.el);

                        if (this.arg.sideBySide.frame.style)
                            elFrame.style = this.arg.sideBySide.frame.style

                        if (this.arg.sideBySide.frame.class)
                            this.arg.sideBySide.frame.class.split(' ').forEach((e) => elFrame.classList.add(e))


                        if (this.arg.sideBySide.frame.buttons)
                            for (let key in this.arg.sideBySide.frame.buttons) {
                                // if (key == 'el' || key == 'style' || key == 'class')
                                //     continue

                                let btn = document.createElement('button');
                                btn.classList.add('btn-Frame', 'btn-Frame-blue')
                                btn.innerHTML = this.arg.sideBySide.frame.buttons[key].html

                                if (this.arg.sideBySide.frame.buttons[key].click)


                                    btn.addEventListener('click', async (e) => {

                                        let innerHTMLbtn = ''


                                        if (this.arg.sideBySide.frame.buttons[key].preLoad) {
                                            //@ts-ignore
                                            innerHTMLbtn = e.target.innerHTML;
                                            //@ts-ignore
                                            e.target.innerHTML = this.arg.sideBySide.frame.buttons[key].preLoad;
                                        }

                                        //@ts-ignore
                                        if (e.target.getAttribute('state') == 'save' || e.target.getAttribute('state') == 'delete')
                                            btn.disabled = !btn.disabled



                                        if (await ax.arg.sideBySide.frame.buttons[key].click(this.sourceSelect, e) == false) {
                                            //@ts-ignore
                                            if (e.target.getAttribute('state') == 'save' || e.target.getAttribute('state') == 'delete')
                                                btn.disabled = !btn.disabled


                                            if (innerHTMLbtn != '')
                                                e.target.innerHTML = innerHTMLbtn;


                                            return false
                                        }


                                        //@ts-ignore
                                        if (e.target.getAttribute('state') == 'save' || e.target.getAttribute('state') == 'delete')
                                            btn.disabled = !btn.disabled


                                        if (innerHTMLbtn != '') {
                                            //@ts-ignore
                                            e.target.innerHTML = innerHTMLbtn;
                                        }

                                        //@ts-ignore
                                        if (e.target.getAttribute('state') == 'insert')
                                            ax.sourceSelect = false;

                                        //@ts-ignore
                                        if ([state.insert, state.update].indexOf(e.target.getAttribute('state')) >= 0) {
                                            this.disableFieldsSideBySide(true)
                                            this.disableBtnsSaveCancel(true)
                                        }

                                        //@ts-ignore
                                        if ([state.save, state.cancel].indexOf(e.target.getAttribute('state')) >= 0) {
                                            this.disableFieldsSideBySide(false)
                                            this.disableBtnsSaveCancel(false)
                                        }

                                    })

                                if (this.arg.sideBySide.frame.buttons[key].class) this.arg.sideBySide.frame.buttons[key].class.split(' ').forEach((e) => btn.classList.add(e))

                                if (this.arg.sideBySide.frame.buttons[key].id) btn.id = this.arg.sideBySide.frame.buttons[key].id

                                //@ts-ignore
                                if (this.arg.sideBySide.frame.buttons[key].style) btn.style = this.arg.sideBySide.frame.buttons[key].style

                                if (this.arg.sideBySide.frame.buttons[key].state) {
                                    btn.setAttribute('state', this.arg.sideBySide.frame.buttons[key].state)
                                    btns[key] = this.arg.sideBySide.frame.buttons[key].state
                                    if (this.arg.sideBySide.frame.buttons[key].state == 'save')
                                        this.listTabForEnter.push(btn)
                                }

                                if (this.arg.sideBySide.frame.buttons[key].state == state.save || this.arg.sideBySide.frame.buttons[key].state == state.cancel) btn.disabled = true

                                this.buttonsFrame[key] = btn

                                elFrame.appendChild(btn)
                                ax.disableFieldsSideBySide(true)
                            }
                    }
            },
            vModel() {
                if (this.arg.sideBySide.vModel)
                    this.arg.sideBySide.vModel({ ...this.sourceSelect })
            },
            duplicity() {

                if (this.arg.sideBySide.duplicity) {
                    this.messageDuplicity = document.createElement('div');
                    if (this.arg.sideBySide.duplicity.dataField)
                        this.arg.sideBySide.duplicity.dataField.forEach((field) => {
                            if (this.elementSideBySide[field] == undefined)
                                return

                            this.elementSideBySide[field].addEventListener('focusout', (e) => {

                                if (e.target.value == '')
                                    return false;

                                if (this.sourceSelect[field] != e.target.value) {
                                    let text = field

                                    // if (this.elementSideBySide[field].previousSibling.previousElementSibling)
                                    //     text = this.elementSideBySide[field].previousSibling.previousElementSibling.innerText
                                    if (this.elementSideBySide[field].previousSibling)
                                        text = this.elementSideBySide[field].previousSibling.innerText
                                    else
                                        if (this.elementSideBySide[field].getAttribute('placeholder'))
                                            text = this.elementSideBySide[field].getAttribute('placeholder')
                                        else
                                            if (this.elementSideBySide[field].getAttribute('label'))
                                                text = this.elementSideBySide[field].getAttribute('label')


                                    this.arg.sideBySide.duplicity.execute({
                                        field: field,
                                        value: e.target.value,
                                        text: text
                                    })
                                }
                            })
                        })
                }
            },
            showMessageDuplicity(text, time = 5000) {
                this.messageDuplicity.innerHTML = text
                this.messageDuplicity.classList.add('treme', 'pnMensDuplicity')
                setTimeout(() => this.messageDuplicity.remove(), time)
                document.body.appendChild(this.messageDuplicity)
            },

            getDuplicityAll() {

                return new Promise(async (res, rej) => {
                    for (let i in this.arg.sideBySide.duplicity.dataField) {
                        let field = this.arg.sideBySide.duplicity.dataField[i]
                        let text = ''
                        if (this.sourceSelect[field] != this.elementSideBySide[field].value) {

                            // if (this.elementSideBySide[field].previousSibling.previousElementSibling)
                            //     text = this.elementSideBySide[field].previousSibling.previousElementSibling.innerText
                            if (this.elementSideBySide[field].previousSibling)
                                text = this.elementSideBySide[field].previousSibling.innerText
                            else
                                if (this.elementSideBySide[field].getAttribute('placeholder'))
                                    text = this.elementSideBySide[field].getAttribute('placeholder')
                                else
                                    if (this.elementSideBySide[field].getAttribute('label'))
                                        text = this.elementSideBySide[field].getAttribute('label')


                            let r = await this.arg.sideBySide.duplicity.execute({
                                field: field,
                                value: this.elementSideBySide[field].value.trim(),
                                text: text
                            })


                            return res(r)
                        }
                    }

                    res(false)
                })
            },
            tabToEnter(name) {

                if (this.arg.sideBySide.tabToEnter != false) {
                    if (this.elementSideBySide[name] == undefined) return false
                    this.elementSideBySide[name].addEventListener('keydown', function (e) {
                        if (e.keyCode == 13) {
                            //@ts-ignore
                            let next = ax.listTabForEnter[ax.listTabForEnter.indexOf(this) + 1]
                            if (next != undefined)
                                if (next.tagName == 'BUTTON' || next.tagName == 'SELECT')
                                    next.focus()
                                else
                                    next.select()

                            e.preventDefault()
                            e.stopPropagation()
                        }
                    })
                }
            },
            focusField(name) {
                if (name == undefined) {
                    if (this.listTabForEnter[0].tagName == 'BUTTON' || this.listTabForEnter[0].tagName == 'SELECT')
                        this.listTabForEnter[0].focus()
                    else
                        this.listTabForEnter[0].select()
                } else
                    if (this.elementSideBySide[name].tagName == 'BUTTON' || this.elementSideBySide[name].tagName == 'SELECT')
                        this.elementSideBySide[name].focus()
                    else
                        this.elementSideBySide[name].select()
            },
            disableBtnsSaveCancel(disabled = true) {

                for (let i in this.buttonsFrame)
                    if (this.buttonsFrame[i].getAttribute('state') == 'save') {
                        if (this.buttonsFrame[i].disabled == disabled) {
                            this.disableFieldsSideBySide(!this.buttonsFrame[i].disabled)
                            for (let i in this.buttonsFrame)
                                if (this.buttonsFrame[i].getAttribute('state'))
                                    this.buttonsFrame[i].disabled = !this.buttonsFrame[i].disabled
                            break
                        }
                    }
            },
            disableFieldsSideBySide(disable = false) {
                for (let i in this.elementSideBySide) {
                    let type = this.elementSideBySide[i].type

                    switch (type) {
                        case 'text':
                        case 'password':
                        case 'textarea':
                        case 'number':
                        case 'tel':
                        case 'date':
                        case 'time':
                        case 'range':
                        case 'hidden':
                            ax.elementSideBySide[i].readOnly = disable
                            break;
                        case 'radio':
                            // eslint-disable-next-line no-case-declarations
                            let radios = { ...ax.elementSideBySide[i] }
                            delete radios.type
                            for (let r in radios) {
                                radios[r].disabled = disable
                                break
                            }
                            break;
                        case 'select-one':
                            ax.elementSideBySide[i].disabled = disable
                            break;
                        case 'checkbox':
                            ax.elementSideBySide[i].disabled = disable
                            break;

                    }
                }
            },
            resizeTitle(resizers) {
                let fieldTitle
                let listContent
                let text
                let width

                resizers.addEventListener('mousedown', function (e) {

                    fieldTitle = ax.gridTitle.querySelector('[name="' + this.parentElement.getAttribute('name') + '"]')

                    text = ax.gridTitle.querySelector('[name="' + this.parentElement.getAttribute('name') + '"]').querySelector('span').innerHTML

                    //@ts-ignore
                    listContent = [...ax.gridContent.querySelectorAll('[name="' + this.parentElement.getAttribute('name') + '"]')]

                    ax.gridTitle.style.cursor = 'col-resize'
                    document.querySelector('html').style.cursor = 'col-resize'

                    e.preventDefault()
                    window.addEventListener('mousemove', resize)
                    window.addEventListener('mouseup', stopResize)
                })

                // eslint-disable-next-line no-inner-declarations
                function resize(e) {
                    width = e.pageX - fieldTitle.getBoundingClientRect().left + 'px'
                    fieldTitle.style.width = width
                    for (let i in listContent) listContent[i].style.width = width
                }

                // eslint-disable-next-line no-inner-declarations
                function stopResize() {
                    if (Object.keys(ax.arg.columns).length > 0)
                        ax.arg.columns[text].width = width
                    else
                        ax.columnsAutoCreate.width = width

                    document.querySelector('html').style.cursor = 'default'
                    ax.gridTitle.style.cursor = "default";
                    window.removeEventListener('mousemove', resize)
                }
            },
            orderByGrid(field, col) {
                if (field == undefined) return

                let label = col.querySelector('label');
                let order = label.getAttribute('order');

                if (field == '_count_') return

                if (order == 'asc') {
                    label.removeAttribute('order')
                    label.classList.remove('xGridV2Asc')
                    label.classList.remove('xGridV2Desc')
                }

                this.gridTitle.querySelectorAll('label').forEach(el => {
                    el.classList.remove('xGridV2Asc')
                    el.classList.remove('xGridV2Desc')
                    el.removeAttribute('order')
                })

                let newArray = this.arg.source.sort(function (a, b) {

                    if (a[field] == null || a[field] == undefined)
                        a[field] = ''
                    if (b[field] == null || b[field] == undefined)
                        b[field] = ''


                    if (order == undefined) {
                        try {
                            return a[field].localeCompare(b[field], undefined, { numeric: true, sensitivity: 'base' })
                        } catch (error) {
                            return (a[field] > b[field]) ? 1 : (a[field] == b[field]) ? ((a[field].size > b[field].size) ? 1 : -1) : -1;
                        }
                    }
                    if (order == 'asc')
                        try {
                            return b[field].localeCompare(a[field], undefined, { numeric: true, sensitivity: 'base' })
                        } catch (error) {
                            return (a[field] < b[field]) ? 1 : (a[field] == b[field]) ? ((a[field].size < b[field].size) ? 1 : -1) : -1;
                        }
                })


                if (order == undefined) {
                    label.setAttribute('order', 'asc')
                    label.classList.add('xGridV2Asc')
                }

                if (order == 'asc') {
                    label.setAttribute('order', 'desc')
                    label.classList.add('xGridV2Desc')
                }

                this.source(newArray)

            },
            filter(filter, call) {

                this.filterControl = true;
                let newData

                if (typeof (filter) == 'string') {

                    filter = filter.trim().split(' ');

                    newData = this.arg.source.filter((el) => {
                        let concat = '';

                        if (!this.arg.filter.fields)
                            this.arg.filter.fields = Object.keys(el)

                        this.arg.filter.fields.forEach((ln) => {
                            concat += el[ln] + ' ';
                        })

                        let retorno = 0;

                        filter.forEach(ln => {
                            if (this.arg.filter.filterBegin)
                                if (concat.toString().toUpperCase().indexOf(ln.toUpperCase()) == 0)
                                    retorno++;

                            if (!this.arg.filter.filterBegin)
                                if (concat.toString().toUpperCase().indexOf(ln.toUpperCase()) > -1)
                                    retorno++;
                        })

                        if (this.arg.filter.conditional == 'AND')
                            if (filter.length == retorno)
                                return true

                        if (this.arg.filter.conditional == 'OR')
                            if (retorno > 0)
                                return true

                    });
                } else
                    if (typeof (filter) == 'object') {

                        newData = this.arg.source.filter((el) => {

                            let retorno = 0;

                            for (let i in filter) {

                                let field = i;
                                let value = filter[i].toString().toUpperCase();

                                if (el[field] == undefined) {
                                    console.log('The field (' + field + ') not find');
                                    return false;
                                }

                                if (this.arg.filter.filterBegin)
                                    if (el[field].toString().toUpperCase().indexOf(value) == 0)
                                        retorno++;

                                if (!this.arg.filter.filterBegin)
                                    if (el[field].toString().toUpperCase().indexOf(value) > -1)
                                        retorno++;
                            }

                            if (this.arg.filter.conditional == 'AND')
                                if (Object.keys(filter).length == retorno)
                                    return true

                            if (this.arg.filter.conditional == 'OR')
                                if (retorno > 0)
                                    return true
                        });

                    }

                this.source(newData)
                call && call(Object.keys(newData).length)

                this.filterControl = false;

            },
            setFilterBegin(filterBegin) {
                this.arg.filter.filterBegin = filterBegin
            },
            setFilterConditional(conditional) {
                this.arg.filter.conditional = conditional
            },
            print(headHTML = '') {
                let iframe = document.createElement('iframe');
                iframe.setAttribute('name', 'iframe')
                iframe.style = 'position:absolute; top:-100000px;'
                // iframe.style = 'position:absolute; top:0px; width:100%; left:0; height:700px'
                document.querySelector('body').appendChild(iframe);
                let frameDoc = iframe.contentWindow ? iframe.contentWindow :
                    iframe.contentDocument.document ? iframe.contentDocument.document :
                        iframe.contentDocument;
                frameDoc.document.open();
                frameDoc.document.write('<html><head><title>Impressão de Documento</title>');
                frameDoc.document.write(`<style>
                *{border: 0;margin: 0;}
                    body{
                        background: #fff; 
                        color: #000; 
                        font: 8pt courier;
                        height: 10%;
                        page-break-before: always;
                    }
                </style>`);
                let style = { ...document.querySelectorAll('link[rel=stylesheet]') }
                for (let i in style) {
                    if (style[i].outerHTML.indexOf('href') >= 0)
                        frameDoc.document.write(style[i].outerHTML)
                }
                frameDoc.document.write('</head>');
                frameDoc.document.write('<body>');

                if (headHTML != '')
                    frameDoc.document.write(headHTML);
                else
                    frameDoc.document.write(printHead);
                frameDoc.document.write(`<div class="xGridV2-main x-print">${ax.element.innerHTML.trim()}</div>`);

                frameDoc.document.write('</body></html>');

                frameDoc.document.close();

                setTimeout(function () {
                    window.frames["iframe"].focus();
                    window.frames["iframe"].print();
                    iframe.remove();
                }, 300);
            },
        }

        ax.arg = Object.assign(argDefault, param);

        ax.constructor();

        this.getAx = () => ax

        this.source = (source) => ax.source(source)

        this.sourceAdd = (source) => ax.createLine(source)

        this.dataSource = (field, value) => ax.dataSource(field, value)

        this.data = () => ax.arg.source

        this.getColumns = () => Object.keys(ax.arg.columns).length > 0 ? ax.arg.columns : ax.columnsAutoCreate

        this.focus = (numLine) => ax.focus(numLine)

        this.disable = (call) => ax.disable(call)

        this.enable = (call) => ax.enable(call)

        this.clear = (call) => ax.clear(call)

        this.load = (text, call) => ax.load(text, call)

        this.closeLoad = (call) => ax.closeLoad(call)

        this.getIndex = () => ax.getIndex()

        this.deleteLine = (index) => ax.deleteLine(index)

        this.insertLine = (param, order, call) => ax.insertLine(param, order, call)

        this.sumDataField = (dataField) => ax.sumDataField(dataField)

        this.getCompare = ax.arg.compare

        this.getElementSideBySideJson = (toUpperCase, empty) => ax.getElementSideBySideJson(toUpperCase, empty)

        this.getDiffTwoJson = (toUpperCase, empty) => ax.getDiffTwoJson(toUpperCase, empty)

        this.clearElementSideBySide = () => ax.clearElementSideBySide()

        this.queryOpen = (param, call) => ax.queryOpen(param, call)

        this.querySourceAdd = (source) => ax.querySourceAdd(source)

        this.getDuplicityAll = () => ax.getDuplicityAll()

        this.showMessageDuplicity = (text, time) => ax.showMessageDuplicity(text, time)

        this.focusField = (name) => ax.focusField(name)

        this.filter = (filter, call) => ax.filter(filter, call)

        this.disableBtnsSaveCancel = (disabled) => ax.disableBtnsSaveCancel(disabled)

        this.disableFieldsSideBySide = (disabled) => ax.disableFieldsSideBySide(disabled)

        this.print = (headHTML) => ax.print(headHTML)

        // this.selectUp = (event) => ax.setaForUp(event)
        this.setKeySelectUp = (codeKey) => ax.arg.keySelectUp = codeKey

        // this.selectDown = (event) => ax.setaForDown(event)
        this.setKeySelectDown = (codeKey) => ax.arg.keySelectDown = codeKey

        this.setFilterBegin = (filterBegin) => ax.setFilterBegin(filterBegin)

        this.setFilterConditional = (conditional) => ax.setFilterConditional(conditional)

    }

    function changeTheme(_theme) {
        defaultTheme = _theme;
        //@ts-ignore
        let el = [...document.querySelectorAll('.xGridV2-main')];
        for (let i in el) {
            el[i].classList = 'xGridV2-main';
            el[i].classList.add(_theme);
        }
    }

    return {
        create: create,
        state: state,
        version: version,
        setNotFound: (value) => { notFound = value },
        getNotFound: () => notFound,
        getPrintHead: () => printHead,
        setPrintHead: (html) => { printHead = html },
        setTheme: (_theme) => { defaultTheme = _theme; },
        changeTheme: changeTheme,
    }
})();
