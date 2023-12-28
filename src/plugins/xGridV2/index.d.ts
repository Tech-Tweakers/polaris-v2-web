export interface ixGridCreate {
    getAx: Function;
    source: (field: object | Array<any>) => void;
    sourceAdd: (field: object | Array<any>) => void;
    // dataSource: (field?: string, value?: string, obj?: Object) => void;
    dataSource: (obj?: any | Object) => any;
    data: () => void;
    getColumns: () => void;
    focus: (indexLine?: number) => void;
    disable: (callback?: Function) => void;
    enable: (callback?: Function) => void;
    clear: (callback?: Function) => void;
    load: (field?: string, callback?: Function) => void;
    closeLoad: (callback?: Function) => void;
    getIndex: (callback?: Function) => void;
    deleteLine: (indexLine?: number) => void;
    insertLine: (object: Object) => void;
    sumDataField: (field: string) => void;
    getCompare: any;
    getElementSideBySideJson: (toUpperCase?: true | false, empty?: true | false) => void;
    getDiffTwoJson: (toUpperCase?: true | false, empty?: true | false) => { old: object, new: object, diff: true | false };
    clearElementSideBySide: Function;
    queryOpen: (field: object, callback?: Function) => Function;
    querySourceAdd: (field: object) => void;
    getDuplicityAll: Function;
    showMessageDuplicity: (text: string, time?: number) => void;
    focusField: (nameField?: string) => void;
    filter: Function;
    disableBtnsSaveCancel: Function;
    disableFieldsSideBySide: Function;
    print: Function;
    setKeySelectUp: Function;
    setKeySelectDown: Function;
    setFilterBegin: Function;
    setFilterConditional: Function;
}

export interface ixGridOptions {
    el: string;
    height?: string | number;
    width?: string | number;
    heightLine?: number;
    count?: boolean;
    title?: boolean;
    setfocus?: number,
    multiSelect?: boolean;
    theme?: "x-grayV2" | "x-darkV2" | "x-opacite" | "x-whiteV2" | "x-blue";
    columns?: {
        [titleColumn: string]: {
            dataField: string,
            width?: string | number,
            left?: boolean,
            center?: boolean,
            right?: boolean,
            render?: Function,
            compare?: string,
            style?: string
        }
    },
    compare?: {
        [name: string]: (dataField: any) => void;
    };
    onSelectLine?: (dataField: any) => void;
    enter?: (dataField: any) => void;
    click?: (dataField: any) => void;
    dblClick?: (dataField: any) => void;
    onKeyDown?: {
        [key: string | number]: (dataField: any, e: any) => void
    }
    keySelectUp?: number | Array<number>,
    keySelectDown?: number | Array<number>,
    filter?: {
        filterBegin?: boolean
        fieldByField?: {
            conditional?: "OR" | "AND"
        }
        concat?: {
            fields?: Array<string | number>,
            conditional?: "OR" | "AND"
        }
    };
    query?: {
        endScroll?: number;
        execute: (rs: { offset: number, page: number, param: object }) => void
    };
    // duplicity?: {
    //     dataField: Array<string>;
    //     execute: (rs: any) => void
    // },
    sideBySide?: {
        el: string;
        vModel?: (dataField: any) => void;
        render?: Function;
        compare?: { [name: string]: (dataField: any) => void; }
        duplicity?: {
            dataField: Array<string>;
            execute?: (rs: { field: string, value: string, text: string }) => void
        }
        frame?: {
            el: string;
            class?: string;
            style?: string;
            buttons?: {
                [nameButton: string]: {
                    html: string;
                    state?: 'save' | 'insert' | 'update' | 'select' | 'cancel' | 'delete';
                    class?: string;
                    style?: string;
                    id?: string;
                    preLoad?: string
                    click: (dataField?: string, e?: any) => void
                }
            }
        }
    }
}

export interface ixGrid {
    create: ixGridOptions
    state: object;
    setNotFound: Function;
    getNotFound: Function;
    getPrintHead: Function;
    setPrintHead: Function;
    setTheme: Function;
    changeTheme: Function
}