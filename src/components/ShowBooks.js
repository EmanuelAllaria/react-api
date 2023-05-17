import React,{useEffect, useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { show_alerta } from '../functions';

const ShowBooks = () => {
    const url = 'http://127.0.0.1:8000/api/books';
    const [books, setBooks] = useState([]);
    const [id, setId] = useState('');
    const [user_id, setUserId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [operation, setOperation] = useState(1);
    const [name, setName] = useState('');

    useEffect(()=>{
        getBooks();
    }, []);

    const getBooks = async () => {
        const respuesta = await axios.get(url);
        setBooks(respuesta.data);
    }

    const openModal = (op, id, title, description) => {
        setId('');
        setUserId('');
        setTitle('');
        setDescription('');
        setOperation(op);
        if(op === 1) {
            setName('Registrar libro')
        } else if(op === 2) {
            setName('Editar libro')
            setId(id);
            setTitle(title);
            setDescription(description);
        }
        window.setTimeout(function() {
            document.getElementById('nombre').focus();
        }, 500);
    }

    const validar = () => {
        var parametros;
        var metodo;
        if(title.trim() === '') {
            show_alerta('Escribe el nombre del libro', 'warning')
        } else if(description.trim() === '') {
            show_alerta('Escribe la descripción del libro', 'warning')
        } else {
            if(operation === 1) {
                parametros = {user_id:user_id, title:title.trim(), description:description.trim()};
                metodo = 'POST';
            } else {
                parametros = {id:id, title:title.trim(), description:description.trim()};
                metodo = 'PUT';
            }
            enviarSolicitud(metodo,parametros)
        }
    }

    const enviarSolicitud = async(metodo,parametros) => {
        await axios({ method:metodo, url:url+'/'+id, data:parametros}).then(function(respuesta){
            var tipo = respuesta.data[0];
            var msj = respuesta.data[1];
            show_alerta(msj, tipo);
            if (tipo === 'success') {
                document.getElementById('btnCerrar').click();
                show_alerta('Exitos', 'success');
                getBooks();
            }
        })
        .catch(function(error){
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        });
    }

    const eliminarLibro = async(id) => {
        await axios({ method:'DELETE', url:url+'/'+id}).then(function(respuesta){
            var tipo = respuesta.data[0];
            var msj = respuesta.data[1];
            show_alerta(msj, tipo);
            if (tipo === 'success') {
                document.getElementById('btnCerrar').click();
                show_alerta('Se eliminó correctamente', 'success');
                getBooks();
            }
        })
        .catch(function(error){
            show_alerta('Error en la solicitud', 'error');
            console.log(error);
        });
    }

    const deleteBook = (id, name) => {
        const MySwal = withReactContent(Swal);
        MySwal.fire({
            title:'Seguro quiere eliminar el libro '+name+' ?',
            icon: 'question',text: 'No se podrá volver a ver',
            showCancelButton:true,confirmButtonText:'Si, eliminar',cancelButtonText:'Cancelar'
        }).then((result) => {
            if(result.isConfirmed) {
                eliminarLibro(id)
            } else {
                show_alerta('el libro no fue eliminado', 'info');
            }
        });
    }

  return (
    <div className='App'>
        <div className='container-fluid'>
            <div className='row mt-3'>
                <div className='col-md-4 offset-md-4'>
                    <div className='d-grid mx.auto'>
                        <button className='btn btn-dark' data-bs-toggle='modal' data-bs-target='#modalBooks'>
                            <i className='fa-solid fa-circle-plus'></i> Añadir
                        </button>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col-12 col-lg-8 offset-0 offset-lg-2'>
                    <div className='table-responsive'>
                        <table className='table table-bordered'>
                            <thead>
                                <tr><th>#</th><th>Nombre</th><th>Descripción</th><th></th></tr>
                            </thead>
                            <tbody className='table-group-divider'>
                                {books.map((books, i) => (
                                    <tr key={books.id}>
                                        <td>{(i+1)}</td>
                                        <td>{books.title}</td>
                                        <td>{books.description}</td>
                                        <td>
                                            <button data-bs-toggle='modal' data-bs-target='#modalBooks' onClick={() => openModal(2,books.id,books.title,books.description)} className='btn btn-warning'>
                                                <i className='fa-solid fa-edit'></i>
                                            </button>
                                            <button onClick={() => deleteBook(books.id, books.title)} className='btn btn-danger'>
                                                <i className='fa-solid fa-trash'></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div id='modalBooks' className='modal fade' aria-hidden='true'>
            <div className='modal-dialog'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <label className='h5'>{name}</label>
                        <button type='button' className='btn-close' aria-label='Close'></button>
                    </div>
                    <div className='modal-body'>
                        <input type='hidden' id='id'></input>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='text' id='user_id' className='form-control' placeholder='ID USER' value={user_id} onChange={(e)=> setUserId(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-gift'></i></span>
                            <input type='text' id='nombre' className='form-control' placeholder='Nombre' value={title} onChange={(e)=> setTitle(e.target.value)}></input>
                        </div>
                        <div className='input-group mb-3'>
                            <span className='input-group-text'><i className='fa-solid fa-comment'></i></span>
                            <input type='text' id='descripcion' className='form-control' placeholder='Descripción' value={description} onChange={(e)=> setDescription(e.target.value)}></input>
                        </div>
                        <div className='d-grid col-6 mx-auto'>
                            <button onClick={() => validar()} className='btn btn-success'>
                                <i className='fa-solid fa-floppy-disk'></i> Guardar
                            </button>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button type='button' id='btnCerrar' className='btn btn-secpndary' data-bs-dismiss='modal'>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ShowBooks