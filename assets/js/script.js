// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

function generateTaskId() {
    nextId++;
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return nextId;
}

function createTaskCard(task) {
    const taskCard = $('<div>').addClass('card task-card draggable').attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header').text(task.title);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-task-id', task.id);

    // Append card elements
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    // Set card background color based on due date
    if (task.dueDate) {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger');
        }
    }

    return taskCard;
}


function renderTaskList() {
    const todoList = $('#todo-cards').empty();
    const inProgressList = $('#in-progress-cards').empty();
    const doneList = $('#done-cards').empty();

    for (let task of taskList) {
        switch (task.status) {
            case 'to-do':
                todoList.append(createTaskCard(task));
                break;
            case 'in-progress':
                inProgressList.append(createTaskCard(task));
                break;
            case 'done':
                doneList.append(createTaskCard(task));
                break;
            default:
                console.error('Invalid task status:', task.status);
        }
    }

    // Reinitialize datepicker
    $('#taskDueDate').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    // Reattach event handler for delete buttons
    $('.delete').on('click', handleDeleteTask);

    // Make cards draggable
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (e) {
            const original = $(e.target).hasClass('ui-draggable') ? $(e.target) : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                maxWidth: original.outerWidth(),
            });
        },
    });
}

function handleAddTask(event) {
    event.preventDefault();
    const task = {
        id: generateTaskId(),
        title: $('#taskTitle').val(),
        description: $('#taskDescription').val(),
        dueDate: $('#taskDueDate').val(),
        status: 'to-do',
    };
    taskList.push(task);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
    $('#taskForm')[0].reset();
}

function handleDeleteTask(event) {
    event.preventDefault();
    const taskId = $(this).attr('data-task-id');
    taskList = taskList.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

function handleDrop(event, ui) {
    const taskId = ui.draggable.data('task-id');
    const newStatus = event.target.id;
    taskList.forEach(task => {
        if (task.id === parseInt(taskId)) {
            task.status = newStatus;
        }
    });
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

$(document).ready(function () {
    renderTaskList();
    $('#taskForm').on('submit', handleAddTask);
    $('.lane').droppable({
        accept: '.task-card',
        drop: handleDrop,
    });
});
