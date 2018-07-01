// Storage Controller
const StorageController = (function() {

    return {
        addNote(note) {
            const notes = StorageController.getNotes();

            notes.push(note);

            localStorage.setItem('notes', JSON.stringify(notes));
        },

        getNotes(note) {
            let notes = localStorage.getItem('notes');

            if (notes === null) {
                notes = [];
            } else {
                notes = JSON.parse(notes);
            }

            return notes;
        },

        saveNotes(notes) {
            localStorage.setItem('notes', JSON.stringify(notes));
        }
    }

})();

// User Interface Controller
const UIController = (function() {

    const UISelectors = {
        openModalButton: '.open-modal-button',
        modal: '.modal',
        formEnd: '.form-end',
        noteForm: '.note-form',
        addButton: '.add-button',
        noteTitle: '#note-title',
        noteContent: '#note-content',
        notesList: '.notes-list',
        noteDetails: '.note-info'
    }

    const state = {
        modalState: null
    }

    return {

        openModal: function() {
            const modalState = UIController.getModalState();

            if (modalState === 'add') {
                const form = document.querySelector(UISelectors.noteForm);

                form.innerHTML = `
                    <div class = 'input-wrapper'>
                        <input type = 'text' id = 'note-title' placeholder = 'Note title...'>
                    </div>

                    <div class = 'input-wrapper'>
                        <textarea type = 'text' id = 'note-content' placeholder = 'Add some content...'></textarea>
                    </div>

                    <button class = 'modal-button add-button'>Добавить</button>
                `;

                document.querySelector(UISelectors.modal).style.display = 'block';
            } else if (modalState === 'edit') {
                const form = document.querySelector(UISelectors.noteForm);

                form.innerHTML = `
                    <div class = 'input-wrapper'>
                        <input type = 'text' id = 'note-title' placeholder = 'Note title...'>
                    </div>

                    <div class = 'input-wrapper'>
                        <textarea type = 'text' id = 'note-content' placeholder = 'Add some content...'></textarea>
                    </div>

                    <button class = 'modal-button edit'>Изменить</button>
                `;

                document.querySelector(UISelectors.modal).style.display = 'block';
            }
        },

        // Close modal on click outside
        closeModalOutside: function(e) {
            const modalClass = UISelectors.modal.replace(/./, '');

            if (e.target.classList.contains(modalClass)) {
                document.querySelector(UISelectors.modal).style.display = 'none';
                UIController.setModalState(null);
            }
        },

        closeModal: function() {
            const modal = document.querySelector(UISelectors.modal);
            modal.style.display = 'none';
        },

        clearModalInputFields: function() {
            document.querySelector(UISelectors.noteTitle).value = '';
            document.querySelector(UISelectors.noteContent).value = '';
        },

        getInputData: function() {
            const title = document.querySelector(UISelectors.noteTitle).value;
            const content = document.querySelector(UISelectors.noteContent).value;

            return {
                title,
                content
            }
        },

        refreshNotesList: function() {
            const list = document.querySelector(UISelectors.notesList);
            const notes = NotesController.getNotes();
            let output = '';

            notes.forEach(note => {
                output += `
                    <li class = 'notes-list-item' id = 'note-${note.id}'>
                        <p>
                            ${note.title}
                        </p>
                        <p>
                            ${note.content}
                        </p>
                    </li>
                `;
            })

            list.innerHTML = output;
        },

        removeHighlightAll: function() {
            let notes = document.querySelectorAll('.notes-list-item');
            notes = Array.from(notes);

            notes.forEach(note => {
                note.classList.remove('active-note');
            })
        },

        showDetailedInfo: function(noteId) {
            const note = NotesController.getNoteById(noteId);
            const noteContainer = document.querySelector(UISelectors.noteDetails);

            NotesController.setCurrentNote(note);

            noteContainer.innerHTML = `
                <div class = 'note-details'>
                    <p class = 'note-info-title'>
                        ${note.title}
                    </p>
                    <div class = 'divider'></div>
                    <p class = 'note-info-content'>
                        ${note.content}
                    </p>
                </div>
                <div class = 'note-controls'>
                    <a class = 'note-controls-button delete-button'>
                        <i class = 'button-icon delete-icon'></i>
                        &nbsp;
                        Удалить
                    </a>
                    <a class = 'note-controls-button edit-button'>
                        <i class = 'button-icon edit-icon'></i>
                        &nbsp;
                        Изменить
                    </a>
                </div>
            `;
        },

        showBlankInfo: function() {
            document.querySelector(UISelectors.noteDetails).innerHTML = '';
        },

        onStartShowNote: function() {
            const notes = NotesController.getNotes();

            if (notes.length) {
                UIController.showDetailedInfo(notes[0].id);
            }
        },

        showModalEdit: function() {
            const note = NotesController.getCurrentNote();

            UIController.setModalState('edit');
            UIController.openModal();

            document.querySelector(UISelectors.noteTitle).value = note.title;
            document.querySelector(UISelectors.noteContent).value = note.content;
        },

        setModalState(type) {
            state.modalState = type;
            console.log(state.modalState);
        },

        getModalState: function() {
            return state.modalState;
        },

        getSelectors: function() {
            return UISelectors;
        }

    }

})();

// Notes Controller
const NotesController = (function() {

    const Note = function(id, title, content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }

    const notes = {
        items: StorageController.getNotes(),

        currentNote: null
    }

    const idGenerator = function() {
        // Если список пуст, то первый id = 0
        let id = 0;

        if (notes.items.length > 0) {
            notes.items.forEach(note => {
                if (note.id > id) id = note.id;
            });

            id += 1;
        }

        return id;
    }

    return {
        addNote: function(note) {
            let id = idGenerator();

            const newNote = new Note(id, note.title, note.content);
            notes.items.push(newNote);
            StorageController.addNote(newNote);

            return newNote;
        },

        deleteNote: function(note) {
            notes.items.forEach((item, index) => {
                if (item.id === note.id) {
                    notes.items.splice(index, 1);
                }
            })

            NotesController.setCurrentNote(null);

            StorageController.saveNotes(notes.items);
        },

        updateNote: function(note) {
            notes.items.forEach((item, index) => {
                if (item.id === note.id) {
                    notes.items.splice(index, 1, note);
                    StorageController.saveNotes(notes.items);
                }
            })

            return note.id;
        },

        getNotes: function() {
            return notes.items;
        },

        getNoteById: function(id) {
            let found;

            notes.items.forEach(note => {
                if (note.id === id) found = note;
            })

            return found;
        },

        getCurrentNote: function() {
            return notes.currentNote;
        },

        setCurrentNote: function(note) {
            notes.currentNote = note;
        },

        logData: function() {
            console.log(notes);
        }
    }

})();

// App Function
const App = (function() {

    const loadEventListeners = function() {
        const selectors = UIController.getSelectors();

        document.querySelector(selectors.openModalButton).addEventListener('click', openModalHandler);
        document.querySelector(selectors.modal).addEventListener('click', UIController.closeModalOutside);
        document.querySelector(selectors.noteForm).addEventListener('click', createUpdateNote);
        document.querySelector(selectors.notesList).addEventListener('click', noteClickHandler);
        document.querySelector(selectors.noteDetails).addEventListener('click', controlsHandler);
    }

    const createUpdateNote = function(e) {
        if (e.target.classList.contains('add-button')) {
            const note = UIController.getInputData();

            if (note.title && note.content) {
                const newNote = NotesController.addNote(note);
                UIController.refreshNotesList();
                UIController.showDetailedInfo(newNote.id);

                UIController.clearModalInputFields();
                UIController.closeModal();
                UIController.setModalState(null);
            }

        } else if (e.target.classList.contains('edit')) {
            const note = UIController.getInputData();

            if (note.title && note.content) {
                const noteId = NotesController.getCurrentNote().id;
                note.id = noteId;
                
                NotesController.updateNote(note);
                UIController.refreshNotesList();
                UIController.showDetailedInfo(note.id);

                UIController.clearModalInputFields();
                UIController.closeModal();
                UIController.setModalState(null);
            }
        }
    }

    const openModalHandler = function() {
        UIController.setModalState('add');
        UIController.openModal();
    }

    const noteClickHandler = function(e) {
        let noteId;

        if (e.target.classList.contains('notes-list-item')) {
            noteId = e.target.id.replace(/note-/, '');
            UIController.removeHighlightAll();
            e.target.classList.add('active-note');
        } else if (e.target.parentElement.classList.contains('notes-list-item')) {
            noteId = e.target.parentElement.id.replace(/note-/, '');
            UIController.removeHighlightAll();
            e.target.parentElement.classList.add('active-note');
        }

        if (noteId !== undefined) {
            noteId = parseInt(noteId);
            UIController.showDetailedInfo(noteId);
        }
    }

    const controlsHandler = function(e) {
        if (e.target.classList.contains('delete-button')) {
            const note = NotesController.getCurrentNote();

            NotesController.deleteNote(note);
            UIController.refreshNotesList();
            UIController.showBlankInfo();
        }

        if (e.target.classList.contains('edit-button')) {
            UIController.showModalEdit();
        }
    }

    return {
        init: function() {
            UIController.refreshNotesList();

            // UIController.onStartShowNote();

            loadEventListeners();
        }
    }

})();

// Initialize App
App.init();