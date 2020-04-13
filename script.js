import { h, app } from "https://unpkg.com/hyperapp"

const pageBack = (state, pages) => {
  
  pages.evt.preventDefault();
  
  var to = document.getElementById(pages.to);
  var from = document.getElementById(pages.from); 
  
  from.setAttribute("data-move", "slideOutRight");
  to.setAttribute("data-move", "slideInLeft");
  
  return { 
    ...state,
    attr : {
       ...state.attr,
       currentPage : pages.to,
       prevPage : pages.from
    }  
  }	
  	
}
const pageForward = (state, pages) => {  
  
  pages.evt.preventDefault();
  
  var to = document.getElementById(pages.to);  
  var from = document.getElementById(pages.from);  
    
  from.setAttribute("data-move", "slideOutLeft");
  to.setAttribute("data-move", "slideInRight");
  
  return { 
    ...state,
    attr : {
       ...state.attr,
       currentPage : pages.to,
       prevPage : pages.from
    }  
  }
  
}

const noteKeyDown = (state, payload) => {
  
  if(state.attr.typingTimer) clearTimeout(state.attr.typingTimer);

  state.currentNote = {};
  state.currentNote.file = state.folders[payload.page].files[payload.note].index;
  state.currentNote.content = payload.evt.target.value;
  
  state.attr.typingTimer = setTimeout(function(){
    
    transferData(updateNoteComplete, { url: "json.php", data: { func: "update_file", 
      content: state.currentNote.content, 
      note: state.currentNote.file
    }});

  }, 2000);
  
  
  state.folders[payload.page].files[payload.note].content = payload.evt.target.value;

  return { 
    ...state,
    folders: [
      ...state.folders
    ]
  }  
}
  
const title = (str) => {

  if(!str) str = " ";

  var arr = str.split("\n");

  var title = arr[0].split(" ", 4).join(" "),
      content = "";
      
  //does the file have more than one line?
  //if so, use the second line as the content

  if(arr.length > 1){

    for(var i = arr.length - 1; i > 0; i--){
      if(arr[i].length > 0) content = arr[i].split(" ", 4).join(" ");
    }
    
  }


    return { title: title, content: content };

}

const editTOC = (state) => {

 if(state.attr.editing){
   
   for(var i = 0; i < state.folders.length; i++){
     state.folders[i].clicked = false;
   }
   
 }  
 
 return {
   ...state,
   attr : {
     ...state.attr,
     editing : !state.attr.editing
   },
   folders : [
     ...state.folders  
   ]
 }} 

const editFolder = (state, payload) => {  
 
 if(state.folders[payload.pageIndex].editing){
   for(var i = 0; i < state.folders[payload.pageIndex].files.length; i++){
     if(state.folders[payload.pageIndex].files[i].clicked){
       state.folders[payload.pageIndex].files[i].clicked = false;
     }
   }
 }

 state.folders[payload.pageIndex].editing = !state.folders[payload.pageIndex].editing;
 
 return {
   ...state,
   folders : [
     ...state.folders
   ]  	
}}  
    
const tocFolderSelected = (state, payload) => {

  payload.evt.stopPropagation();
  //event, from, id
  
  state.folders[payload.id].clicked = !state.folders[payload.id].clicked;
  
  console.log(state);
  
  return {
  	...state,
  	folders : [
  		...state.folders
  	]
  }
} 

const fileSelected = (state, payload) => {

  console.log(state);


  payload.evt.stopPropagation();
  //event, from, id
  
  state.folders[payload.from].files[payload.id].clicked = !state.folders[payload.from].files[payload.id].clicked;
  
  return {
  	...state,
  	folders : [
  		...state.folders,
  	]
  }
} 
 
//count how many items are clicked inside a folder or TOC 
const countSelected = items => {
  
  var c = 0;
  for(var i = 0; i < items.length; i++){
    if(items[i].clicked) c++;
  }
  return c;
  
}

//DONE
const createFolder = (state, payload) => {
  var str = prompt("Name for new folder: ");

  if(str){
      return [{ 
        ...state,
        folders : [
        ...state.folders,
        { title : str, files : [] }]
      },
      [ transferData, { onresponse: createFolderComplete, url:"json.php", data: { data: str, func: "create_folder" } } ]
      ]
  }
  else return state;
}
const createFolderComplete = (state, data) => { 
  console.log(data);
  state.folders[state.folders.length-1].index = data["data"];
  return state; } 

//DONE
const createNote = (state, payload) => { 
  state.folders[payload.id].files.push({ content: "new note" })     
        
  return [{ 
        ...state,
        folders : [
        ...state.folders ] },
        
        [ transferData, { onresponse: createNoteComplete, url: "json.php", data: { func: "create_file", folder: state.folders[payload.id].index } }  ]
        
        ]  
}
const createNoteComplete = (state, data) => { 
  for(var i = 0; i < state.folders.length; i++){
    if(state.folders[i].index == data.folderId){
      state.folders[i].files[state.folders[i].files.length-1].index = data.data;
    }
  }
  return state;
 } 

//DONE
const updateFolder = (state, payload) => {
  
    payload.evt.stopPropagation();
  
  var str = prompt("Rename folder: ");

  if(str){
    state.folders[payload.folder].title = str;
    return [{ 
      ...state,
      attr: {
        ...state.attr,
        editing: false
      },
      folders : [
      ...state.folders ]
    },
    [ transferData, { onresponse: createFolderComplete, url: 'json.php', data: { name: str, id: state.folders[payload.folder].index, func: "update_folder" } }] ];
    
    
  }
  else return state;
  
}
const updateFolderComplete = (state, data) => { return state; }    

//DONE
//const updateNote = (state, payload) => { }
const updateNoteComplete = (state, data) => { 
  return state; 
}    

//DONE
const deleteFolder = (state, payload) => {

  var arr = [],
      deleteArr = [];
  
  for(var i = 0; i < state.folders.length; i++){
    if(!state.folders[i].clicked) arr.push(state.folders[i]);
    else deleteArr.push(state.folders[i].index);
  }
 
  state.folders = arr;

  return [{ 
    ...state,
    attr : { 
      ...state.attr,
      editing : false },
    folders : [
      ...state.folders
    ]
  }, [transferData, { onresponse: deleteFolderComplete, url: "json.php", data: { data: deleteArr, func: "delete_folder" }}] ]   
  
}
const deleteFolderComplete = (state, data) => { return state; } 

//DONE
const deleteNote = (state, payload) => {

  var arr = [],
      deleteArr = [];
  
  for(var i = 0; i < state.folders[payload.pageIndex].files.length; i++){
    if(!state.folders[payload.pageIndex].files[i].clicked) arr.push(state.folders[payload.pageIndex].files[i]);
    else deleteArr.push(state.folders[payload.pageIndex].files[i].index);
  }
 
  state.folders[payload.pageIndex].files = arr;



  return [{ 
    ...state,
    attr : { 
      ...state.attr,
      editing : false },
    folders : [
      ...state.folders
    ]
  }, [transferData, { onresponse: deleteNoteComplete, url: "json.php", data: { data: deleteArr, func: "delete_file" }}] ]   
   
  
  
}
const deleteNoteComplete = (state, data) => { return state; } 

// VIEW //

/*
 
 RETURN AN ARRAY, SECOND PART OF ARRAY IS THE HTTP - SEE
 https://hyperapp.dev/tutorial#declaringeffects
 
 create folder
 create note
 
 update folder { name }
 update note { content ( there is no name ) }
 
 delete folder
 delete note

*/

//EFFECTS (SENDING/RECIEVING)

const transferData = (dispatch, options) =>
  fetch(options.url, {method: 'POST', body: JSON.stringify(options.data)})
    .then(response => response.json())
    .then(data => dispatch(options.onresponse, data))
    .catch(() => dispatch(options.onresponse, {}))
    
//VIEW//    

const nav = (to, from, edit, editing, pageIndex) => (
  h("div", {class:"nav"}, 
    h("p", {class: "nav-left", ontouchstart: (to)? [pageBack, e => ( { evt: e, to: to, from: from } )] : ""}, 
      h("span", {}, to? "<" : "")),
    h("p", {class: "nav-right" }, 
      h("span", { onclick: (from == "tableofcontents")? [ editTOC, e => ({ evt: e }) ] 
      : [ editFolder, e => ({ evt: e, pageCalled: from, pageIndex: pageIndex }) ]}, 
      (edit)? ((editing)? "Cancel" : "Edit" ) : "", )))) 

const footer = (editing) => ( (!editing)? h("div", { class:"footer", onclick: createFolder, }, "New Folder")
                         : h("div", { class:"footer", onclick: deleteFolder, }, "Delete Folder"))

const fileFooter = (editing, pageIndex) => ( (!editing)? h("div", { class:"footer", onclick: [createNote, { id : pageIndex }] }, 
                          h("img", { src : "https://sean-mcdonald.com/images/icons8-pencil-50.png"}, "")    )
                         : h("div", { class:"footer", onclick: [deleteNote, e => ({ evt: e, pageIndex: pageIndex }) ]  }, "Delete") )

const tableOfContents = (props) => ( h("div", {class: (props.attr.currentPage == "tableofcontents")? "page current-page" : "page", id: "tableofcontents"}, 
  h("div", {class:"container"}, 
    nav("", "tableofcontents", true, props.attr.editing),
    h("h1", { class: "heading"}, (props.attr.editing)? countSelected(props.folders)+" Selected" : "Folders"),
    h("div",{ class: "folder-list" }, 
    Object.keys(props.folders).map(i => (
      h("div", {ontouchstart: [pageForward, e => ({evt: e, to: "file-"+i, from: "tableofcontents"}) ]},
        h("div", {},
          h("div", { class: (props.attr.editing)? "text-over slideTextRight" : (props.attr.editing === undefined)? "text-over" : "text-over slideTextLeft" }, 
            props.folders[i].title, 
            (props.attr.editing)? h("img", { src : "https://sean-mcdonald.com/images/icons8-pencil-50.png", ontouchstart: [updateFolder, e => ({ evt: e, folder: i }) ]}, "") : ""),
          h("div", { class: (props.folders[i].clicked)? "circle-under clicked " : "circle-under", ontouchstart : [ tocFolderSelected, e => ({ evt: e, from: "tableofcontents", id: i }) ] }), ""),
        h("div", {class:"folder-count"}, Object.keys(props.folders[i].files).length+" >")) )  )),
    footer(props.attr.editing))))
     
const folders = (props) => (
  Object.keys(props.folders).map(i => 
    h("div", {class: (props.attr.currentPage == "file-"+i)? "page current-page" : "page", id: "file-"+i },
      h("div", {class:"container"}, 
        nav("tableofcontents", "file-"+i , true, props.folders[i].editing, i),
        h("h1", {class:"heading"}, (props.folders[i].editing)? countSelected(props.folders[i].files)+" Selected" : props.folders[i].title),
        h("div",{ class: "file-list" }, 
        Object.keys(props.folders[i].files).map(j =>
          h("div", { ontouchstart: [ pageForward, e => ({ evt:e, to:"note-"+i+"-"+j, from: "file-"+i }) ] }, 
            h("div", {class: (props.folders[i].editing)? "text-over slideTextRight" : (props.attr.editing === undefined)? "text-over" : "text-over slideTextLeft" },
              h("div", {class:"file-title"}, title(props.folders[i].files[j].content).title), 
              h("p", {class:"file-preview"}, title(props.folders[i].files[j].content).content)),
            h("div", {class: (props.folders[i].files[j].clicked)? "circle-under clicked " : "circle-under", ontouchstart : 
            [ fileSelected, e => ({ evt: e, from: i, id: j }) ] })) )),
        fileFooter(props.folders[i].editing, i)  ))  ));

const eachNote = props => (
  Object.keys(props.folders).map(i => 
    Object.keys(props.folders[i].files).map(j =>
    h("div", {class: (props.attr.currentPage == "note-"+i+"-"+j)? "page current-page" : "page", id: "note-"+i+"-"+j },
      h("div", {class:"container"}, 
      nav("file-"+i, "note-"+i+"-"+j, false),
      h("textarea", { rows: 40, cols: 40, onkeyup : [noteKeyDown, e => ({ page: i, note: j, evt : e }) ] }, props.folders[i].files[j].content))) )  ));

const container = props => h("div", {},   
  tableOfContents(props),
  folders(props),
  eachNote(props))

const getDataComplete = (state, data) => { 
  return { 
    ...state,
    folders:  data 
  }
}

app({ init: [ { attr: { currentPage: "tableofcontents", prevPage: "", typingTimer:null } },
              [ transferData, 
                { onresponse: getDataComplete, url: "json.php", data: { func: "get-data" } } ]
            ],
      node: document.getElementById("hyperapp"),
      view: state => container(state)  
   });

