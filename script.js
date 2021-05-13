import { h, text, app } from "https://unpkg.com/hyperapp"

app({
  node: document.getElementById('app'),
  init: {attr: {"loggedIn":true, currentPage:"current-page", editing:false},
          folders:[
    {"index":"10","title":"School Ideas","files":[{"index":"15", "content":"ABC 3D by Marion Bataille  OK yes hi"}]},
    {"index":"15","title":"Info","files":[]},
    {"index":"20","title": "Files", "files": [{index: 99,  "content":"my info"}]},
    {"index":"18","title":"To do ","files":[]},
    {"index":"19","title":"Passwords","files":[{"index":"25", "content":"Router\nadmin\nGo******"}]},
    {"index":"20","title":"Yo","files":[{"index":"30", "content":"yoyoyo!"}]}
    ]},
    view: state => h("div", {}, view(state))
}) 

const view = json => TableOfContentsPage(json).concat(GetFolderPages(json)).concat(GetFilePages(json).concat(MessagePage(json)))

//TABLE OF CONTENTS
const TableOfContentsPage = json => [h("div", 
                                       { 
                                     id: "tableofcontents",
                                     class: "page "+json.attr.currentPage }, 
                                        [ TOCNav(json.attr.editing), TOCHeader(json), TOCContent(json), TOCFooter(json)] )]

const TOCNav = editing => h("div", { id: "toc-nav"}, 
                            h("p", 
                              { onclick: editTOC }, 
                              (editing)? text("Cancel") : text("Edit")))
                                
const TOCHeader = json => h("h1", { class: "pad-left"},  
                            (json.attr.editing)? text(countSelected(json.folders)+" Selected") : text("Folders"))

const TOCContent = json => h("div", { id: "toc-content" }, json.folders.map((i, ind)=>
         h("div", { onclick: [toFolder,ind] }, [
            h("div", { class: "folder-title-left"}, [
                h("div", { class: (json.attr.editing)? "text-over slideTextRight" : "text-over slideTextLeft"}, [
                   text(i.title), 
                   (json.attr.editing)? 
                   h("div", { class: "pencil", "data-id" : ind, onclick:updateFolder }) 
                   :text("") 
                  ]),
                  h("div", { 'data-ind':ind, class: (i.clicked)? "circle-under clicked" : "circle-under", 
                             onclick : selectedFolder })
              ]),
            h("div", {class:"folder-title-right"}, text(i.files.length+" >"))])))

const TOCFooter = (state) => ( 
  (!state.attr.editing)? h("div", { id:"toc-footer", onclick: createFolder, }, text("New Folder"))
  : h("div", { id:"toc-footer", onclick: deleteFolder}, 
      (countSelected(state.folders) > 1)? text("Delete Folders") : 
      (countSelected(state.folders) > 0)? text("Delete Folder") :
      text("")))


//FOLDERS
const GetFolderPages = json => json.folders.map((i,ind)=>Folder(i, ind))
const Folder = (i,ind) => h("div", { id: "folder-"+ind,
                                         class: "page "+i.currentPage }, 
                          [ FolderNav(i,ind), FolderHeader(i), FolderContent(i), FolderFooter(i)])
//FOR EACH FOLDER...
const FolderNav = (i, ind) => h("div", { class: "folder-nav"}, [
                            h("div", { class:"folder-nav-left", 
                                      onclick: toTOC }, 
                              text("< folders")),
                            h("div", { class:"folder-nav-right", onclick: [editFolder, i]
                                      }, 
                                     (i.editing)? text("Cancel") : text("Edit"))
                            ])

const FolderHeader = i => h("h1", { class: "pad-left" }, 
                            (i.editing)? text(countSelected(i.files)+" Selected") 
                            : text(i.title))

const FolderContent = i => h("div", { class: "folder-content"}, i.files.map(( j, ind)=>
                                                           
         h("div", { onclick: [toFile,j] },[
            h("div", { class: "file-title-left"}, 
              [
                h("div", { class: (i.editing)? "text-over slideTextRight" : "text-over slideTextLeft"},
                   text(j.content.substr(0,5)+"  ...")),
                  h("div", { "data-folder":i.index, "data-file":ind, class: (j.clicked)? "circle-under clicked" : "circle-under", 
                             onclick : selectedFile })
              ]),
            h("div", {class:"file-title-right"}, text(">"))] )  ) )
                                                                            
  

const FolderFooter = f => ( 
  (!f.editing)? h("div", { class:"folder-footer", onclick: [createFile,f.index] }, text("New Note"))
  : h("div", { class:"folder-footer", onclick: [deleteFile,f]}, 
      (countSelected(f.files) > 1)? text("Delete Notes") : 
      (countSelected(f.files) > 0)? text("Delete Note") :
      text("")))

//FILES
const GetFilePages = json => json.folders.reduce( (accumulator, currentValue) => 
  [...accumulator, ...currentValue.files], []).map(i=>File(i))
const File = i => h("div", {id: "file-"+i.index, class: "page "+i.currentPage }, [ FileNav(i) /*, FileHeader(i)*/, FileContent(i) /*, FileFooter(i) */])
//FOR EACH FILE...
const FileNav = i => h("div", { class: "file-nav"}, 
                            h("div", { class:"file-nav-left", 
                                      onclick: [leaveFile, i] }, 
                              text("< "+i.folderName)))

const FileHeader = file => h("h1", {class:"pad-left"}, text("File Contents"));
const FileContent = file => h("textarea", {class:"pad-left", 
                                           onkeyup:withPayload(
                                           (event) => [fileUpdate,{ f: file, event: event }]
                                           )}, 
                                           text(file.content));
const FileFooter = file => h("div", {}, text("File footer"));
 
//Prompt Page
const MessagePage = (state) =>{
  
  if(state.prompt){
  
  return [h("div", { class: "prompt" }, [
            h("h3", {}, text(state.prompt.message)),
            h("input", { id:"user-input", oninput: MessagePageInput } ),
            h("button", { onclick: [state.prompt.callback, state.prompt.input] },
               text(state.prompt.button)),
            h("button", { onclick: cancelPrompt}, text("cancel"))]
           )];
  }
  else return null;
}
const MessagePageInput = (state, input) =>{
  return {...state, prompt: { ...state.prompt, input : input.target.value } };
}
const cancelPrompt = state =>({...state, prompt:null })

//ACTIONS
const withPayload = (filter) => (_, x) => filter(x);

const editTOC = state =>{ return {...state, attr: { ...state.attr, editing: !state.attr.editing } } }
const editFolder = (state, folder) =>{
  state.folders.forEach((i,ind)=>{ 
    if(i.index == folder.index){
      i.editing = !i.editing;   
    }
  }); 
  return { ...state,
            folders: [ ...state.folders ]
         };
} 
const countSelected = folders => folders.reduce((accum, curr)=>(accum + (curr.clicked? 1 : 0)), 0)
const deleteFolder = (state) =>{
  
  state.folders = state.folders.filter((i,ind) => i.clicked !== true)
  
  return {
    ...state,
    folders:[
      ...state.folders
    ]
  }
  
}



const createFolder = (state) => {
      return { 
        ...state,
        prompt : { message: "New Folder Title", button: "create folder", callback: newFolderNamed }
      }
  //}
  //else return state;
}

const deleteFile = (state, folder) =>{
  
  folder.files = folder.files.filter((i,ind) => i.clicked !== true)
  
  return {
    ...state,
    folders:[
      ...state.folders
    ]
  }  
} 


const createFile = (state, index) => {
      
      state.folders.forEach((i)=>{
        if(i.index == index)i.files.push({index:i.index+"-"+i.files.length, content:""})
      });
  
      return { 
        ...state,
        folders:[
          ...state.folders
        ]  
      
      }
}

const toFolder = (state, folder) =>{ 
  state.folders[folder].currentPage = "slideInRight";
  return {
    ...state,
    folders: [...state.folders],
    attr : { ... state.attr, currentPage : "slideOutLeft" }
  }
}

const toTOC = state =>{ 
  state.folders.forEach(i=>i.currentPage = "slideOutRight");
  return { ...state, 
           attr: { ...state.attr, currentPage: "slideInLeft" }
         }
}

const toFile = (state, k) =>{ 
   state.folders.forEach((i,ind)=>i.files.forEach(j=>{
  
   if(j.index == k.index){
    j.currentPage = "slideInRight";
    j.folderName = i.title;
    state.folders[ind].currentPage = "slideOutLeft" 
   }
  }));
  
  return { ...state,
            folders: [ ...state.folders ]
         };
}

const leaveFile = (state, file) => {
  state.folders.forEach((i,ind)=>i.files.forEach((j, jind)=>{ 
    if(j.index == file.index){
      state.folders[ind].files[jind].currentPage = "slideOutRight";
      state.folders[ind].currentPage = "slideInLeft";
    }   
  }));
  
  return { ...state,
            folders: [ ...state.folders ]
         };
}

const selectedFolder = (state, event) =>{ 
  
  event.stopPropagation();
    
  state.folders[event.target.getAttribute("data-ind")].clicked = 
  !state.folders[event.target.getAttribute("data-ind")].clicked;
  return { ...state, folders: [ ...state.folders ] }; 
};

const selectedFile = (state, event) =>{ 
  
  event.stopPropagation();
    
  state.folders.forEach(i=>{
    if(i.index == event.target.getAttribute("data-folder")){
       
       i.files[event.target.getAttribute("data-file")].clicked = 
       !i.files[event.target.getAttribute("data-file")].clicked;    
    }
  });
  
  console.log(state);
  
  return { ...state, folders: [ ...state.folders ] }; 
};

const updateFolder = (state, event) => {
  event.stopPropagation();
  return { ...state, 
          prompt : { message: "Edit Folder Title", button: "rename folder", 
                    callback: FolderRenamed, data: event.target.getAttribute("data-id") }
         } 
}
const FolderRenamed = (state) =>{
  state.folders[state.prompt.data].title 
    = state.prompt.input; 
  
  console.log(state);
  
  return { 
    ...state,
    prompt : null,
    folders: [ ...state.folders ]
  }
}

const newFolderNamed = (state, name) =>{
  return { 
    ...state,
    prompt : null,
    folders: [ ...state.folders, {title: name, files: []} ]
    
         }
}

const fileUpdate = (state, {f, event}) =>{
  
  state.folders.forEach(i=>i.files.forEach(j=>{
    if(j.index == f.index) j.content = event.target.value; 
  }));
  
  
  return {
    ...state,
    folders:[
      ...state.folders
    ]
    
  }
  
}
