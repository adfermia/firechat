import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public chats: any[] = [];
  public usuario: any = {};

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth ) {

    this.afAuth.authState.subscribe( user => {


        if (!user) {
          return;
        }
        console.log('Hay un usuario: ', user.displayName);
        console.log('Hay un usuario: ', user.uid);
        this.usuario.nombre = user.displayName;
        this.usuario.uid = user.uid;
    });
  }

  login(proveedor: string) {
    if ( proveedor === 'google') {
      this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    }
    if (proveedor === 'twitter') {
      this.afAuth.auth.signInWithPopup(new auth.TwitterAuthProvider());
    }

  }
  logout() {

    this.usuario = {};
    this.afAuth.auth.signOut();
    console.log('logout');
  }

  cargarMensajes() {
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc').limit(5));

    return this.itemsCollection.valueChanges().pipe(map((mensajes: Mensaje[]) => {
      console.log(mensajes);
      this.chats = [];
      // tslint:disable-next-line: prefer-const
      for ( let mensaje of mensajes) {
            this.chats.unshift(mensaje);
      }
      // this.chats = mensajes;
    })
    );
  }

  agregarMensaje(texto: string) {
    // TODO falta el UID del usuario
      // tslint:disable-next-line: prefer-const
      let mensaje: Mensaje = {
        nombre: this.usuario.nombre,
        mensaje: texto,
        fecha: new Date().getTime(),
        uid: this.usuario.uid
      };

      return this.itemsCollection.add( mensaje );
  }
}
