import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) 
      buttonNewBill.addEventListener('click', this.handleClickNewBill)
      /*
    if (buttonNewBill) {
      buttonNewBill.addEventListener('click', this.handleClickNewBill)
    } else {
      console.log("New Bill");
      // const errorMessageFile = document.querySelector(`button[data-test-id="btn-new-bill-error"]`)
      // errorMessageFile.style.display = "none";
      // errorMessageFile.style.color = "red";

      const cible = document.getElementsByClassName('content-header');
      console.log(cible);
      const errorMessage = document.createElement('div');
      errorMessage.textContent = 'Le boutton Nouvelle note de frais est abscent';
      errorMessage.classList.add('visible', true);
      cible.appendChild(errorMessage);

    }
    */
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img data-testid="modalBillImg" width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      console.log(this.store);
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
           // console.log(doc)
           //console.log({...doc})
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
        return bills
      })
    }
  }
}
