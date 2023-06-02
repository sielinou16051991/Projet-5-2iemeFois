import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    let errorMessageFile = this.document.getElementById('errorMessageFile');
    errorMessageFile.style.display = "none";
    errorMessageFile.style.color = "red";
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    console.log('envoyer')
    e.preventDefault()
    console.log(e.preventDefault())
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // const filePath = e.target.value.split(/\\/g)
    // const fileName = filePath[filePath.length-1]

    const fileName = file.name
    const isImage = ['image/png', 'image/jpg', 'image/jpeg'].includes(file.type)
    console.log(errorMessageFile.style);

    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    console.log(file)

    if(isImage) {
      console.log(isImage);
      console.log('message d\'erreur masqué');
      // errorMessage.ClassList.add('d-none');
      errorMessageFile.style.display = "none";

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          errorMessageFile.style.display = "none";
          console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))
    }else{
      errorMessageFile.style.display = "block";
      // this.document.ClassList.add('file-mesage-error');
      console.log('afficher le message d\'erreur');
      e.target.value = '';
      // errorMessage.ClassList.remove('d-none');
      console.log('it is not image')
    }

  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    console.log(bill);
    if (this.store) {
      console.log(this.store);
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}