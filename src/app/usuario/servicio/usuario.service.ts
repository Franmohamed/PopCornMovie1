import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../interface/Usuario.interface';
import { Observable } from 'rxjs';
import { Playlist } from '../../Playlist/interface/Playlist.interface';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  http = inject(HttpClient)
  baseUrl = environment.urlUser

  constructor() { }
   // Obtener la lista de todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  // Obtener un usuario por ID
  getUsuarioById(id: string | undefined): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo usuario
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrl, usuario)

  }

  // Actualizar un usuario existente
  updateUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${usuario.id}`, usuario)
  }

  // Eliminar un usuario por ID
  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }


   // Agregar una playlist a un usuario
   addPlaylistToUser(userId: string | undefined, playlist: Playlist): Observable<Usuario> {


    // Obtener el usuario por su ID
    const userById = this.getUsuarioById(userId);
  
    // Suscribirse al observable para obtener el usuario
    userById.subscribe({
      next: (user: Usuario) => {
        // Agregar la nueva playlist al array de playlists del usuario
        user.playlists.push(playlist);
  
        // Actualizar el usuario con la nueva playlist
        this.updateUsuario(user).subscribe({
          next: () => {
            alert('Playlist agregada exitosamente.')
          },
          error: (e : Error) => {
            // Manejar errores en la actualización del usuario
            console.error('Error al actualizar el usuario:', e.message);
          }
        });
      },
      error: (e : Error) => {
        console.error('Error al obtener el usuario:', e.message);
      }
    });
  
    // Retornar el observable del usuario obtenido
    return userById;
  }

  // Eliminar una playlist de un usuario
  removePlaylistFromUser(userId: string, playlistId: number): Observable<Usuario> {
    // Obtener el usuario por su ID
    const userById = this.getUsuarioById(userId);
  
    // Suscribirse al observable para obtener el usuario
    userById.subscribe({
      next: (user: Usuario) => {
        // Filtrar las playlists para eliminar la que coincide con el ID proporcionado
        user.playlists = user.playlists.filter(p => p.id !== playlistId);
  
        // Actualizar el usuario con la lista de playlists modificada
        this.updateUsuario(user).subscribe({
          next: () => {
            alert('Playlist eliminada exitosamente.')
          },
          error: (e:Error) => {
            console.error('Error:', e.message);
          }
        });
      },
      error: (e:Error) => {
        console.error('Error:', e.message);
      }
    });
  
    // Retornar el observable del usuario obtenido
    return userById;
  }

  //Listar playlist
  getPlaylistsOfUser(userId: string): Observable<Playlist[]> {
    // Crear un nuevo Observable que emitirá las playlists del usuario
    return new Observable<Playlist[]>((observer) => {
      // Obtener el usuario por su ID
      this.getUsuarioById(userId).subscribe({
        next: (user: Usuario) => {
          //Emitir las playlists del usuario
          observer.next(user.playlists);
          observer.complete();
        },
        error: (e: Error) => {
          console.error('Error al obtener el usuario:', e.message);
          //Emitir el error al observer
          observer.error(e);
        }
      });
    });
  }

  getDetailOfPlaylist(userId: string, playlistId: number): Observable<Playlist> {
    return new Observable<Playlist>((observer) => {
      this.getUsuarioById(userId).subscribe({
        next: (user: Usuario) => {
          const playlist = user.playlists.find(p => p.id === playlistId);
          if (playlist) {
            observer.next(playlist); 
            observer.complete();
          } else {
            observer.error(new Error('Playlist no encontrada'));
          }
        },
        error: (e: Error) => {
          observer.error(e);
        }
      });
    });
  }

}

  
