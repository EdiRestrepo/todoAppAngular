import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Injector, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from './../../models/task.model'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tasks = signal<Task[]>([
    // {
    //   id: Date.now(),
    //   title: 'Crear proyecto',
    //   completed: false
    // },
    // {
    //   id: Date.now(),
    //   title: 'Crear componente',
    //   completed: false
    // },
  ]);

  filter = signal<'all' |'pending' | 'completed' >('all');

  // computed calculas nuevos estados y genera una nueva señal
  tasksByFilter = computed(()=>{
    const filter = this.filter();
    const tasks = this.tasks();

    if(filter === 'pending'){
      return tasks.filter(task => !task.completed);
    }

    if(filter === 'completed'){
      return tasks.filter(task => task.completed);
    }

    return tasks;
  })

  newTaskCtrl = new FormControl('',{
    nonNullable: true,
    validators: [
      Validators.required,
    ]
  });

  injector = inject(Injector);

  // constructor(){

  // }

  ngOnInit(){
    const tasksStorage = localStorage.getItem('tasks');
    if(tasksStorage){
      const tasks = JSON.parse(tasksStorage);
      this.tasks.set(tasks);
    }

    this.trackTasks();
  }

  trackTasks(){
      // cada que una señal cambia va a ejecutar una logica, en este caso cada que la señal tasks cambie
      // TODO: SI el effect se ejecuta fuera del constructor se debe de aplicar un injector
      effect(()=>{
        const tasks = this.tasks();
        console.log(tasks)
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('run effect')
      }, {injector: this.injector})
  }

  changeHandler(event: Event){
    const input = event.target as HTMLInputElement;
    const newTasks = input.value;

    this.addTask(newTasks);
  }

  changeHandlerReactivo(){
    if(this.newTaskCtrl.valid){
      const value = this.newTaskCtrl.value.trim();
      if(value !== ''){
        this.addTask(value);
        this.newTaskCtrl.setValue('');
      }
    }
  }

  addTask(title: string){
    const newTask = {
      id: Date.now(),
      title,
      completed: false,
    }
    this.tasks.update((tasks)=> [...tasks, newTask]);
  }

  deleteTask(index: number){

    this.tasks.update((tasks)=> tasks.filter((task, position)=>position !== index));
  }

  updateTask(index: number){

    this.tasks.update((tasks)=> {
      return tasks.map((task, position) =>  {
        if(position === index){
          return {
            ...task,
            completed: !task.completed
          }
        }

        return task;
      })
    })

    // this.tasks.mutate(state => {
    //   const currentTask = state[index];
    //   state[index] = {
    //     ...currentTask,
    //     completed: !currentTask.completed
    //   }
    // })
  }

  updateTaskEditingMode(index: number){
    this.tasks.update((tasks)=> {
      return tasks.map((task, position) =>  {
        if(position === index){
          return {
            ...task,
            editing: true
          }
        }

        return {
          ...task,
        editing: false
      };
      })
    })

  }

  updateTaskText(index: number, event: Event){
    const input = event.target as HTMLInputElement;
    this.tasks.update((tasks)=> {
      return tasks.map((task, position) =>  {
        if(position === index){
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }

        return task;
      })
    })

  }

  changeFilter(filter: 'all' |'pending' | 'completed'){

    this.filter.set(filter);

  }
}
