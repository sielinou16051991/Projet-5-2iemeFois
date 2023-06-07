/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { toHaveClass } from "@testing-library/jest-dom";
import mockStore from "../__mocks__/store";

const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
describe("Given I am connected as an employee", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
  })

  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Act: simple navigation
      router()
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      expect(mailIcon).toHaveClass('active-icon')

      // const html = NewBillUI();
      // document.body.innerHTML = html;
      // to-do write assertion
    })

    describe('When I opload a wrong file', () => {

      test('then red error message show', async () => {

        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });
        const inputFile = screen.getByTestId('file');
        const errorMessageFile = screen.getByTestId('error-message-file');

        // parametrage des données pour le tes du fichier chargé
        const loardFile = new File(['test-file'], 'test-file.txt', { type: 'text/plain' });

        // Action de chargement du fichier
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener('change', handleChangeFile);
        userEvent.upload(inputFile, loardFile);

        // Assertion 
        expect(handleChangeFile).toHaveBeenCalled();
        expect(inputFile.files[0].type).toBe('text/plain');

        // Assertion error message
        await waitFor(() => screen.getByTestId('error-message-file'));
        expect(screen.getByTestId('error-message-file')).not.toHaveAttribute('errorMessageFile');
        expect(errorMessageFile).toBeTruthy(); // s'assurer que le message d'erreur ,est bien chargé

      });
    })

    describe('When I uploade a file with the good format', () => {

      test('Then it should display the file name and hide the error message', async () => {

        // Paramettrage 
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const inputFile = screen.getByTestId('file');

        // Paramettrage pour le format de données qui doit etre chargé
        const formatGoodFile = new File(['test-file'], 'test-file.png', { type: 'image/png' });

        // Action: simulation du comportement de la fonction handleSChange de NewBill
        // ( chargement d'un fichier apartir d'un évennement)
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        inputFile.addEventListener('change', handleChangeFile);
        userEvent.upload(inputFile, formatGoodFile);

        // Assert
        expect(handleChangeFile).toBeCalled();
        expect(inputFile.files[0].name).toBe('test-file.png');
        expect(inputFile.files[0].type).toBe('image/png');
        expect(inputFile.files[0]).toStrictEqual(formatGoodFile);

        // Assertion error message
        await waitFor(() => screen.getByTestId('error-message-file'));
        expect(screen.getByTestId('error-message-file')).not.toHaveAttribute('errorMessageFile');
      });
    });
    describe('When I submit the form with the empty filds', () => {

      test('Then should stay on newBill page', () => {

        // parametrage de la creation de la page html d'une nouvelle facture
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, localStorage: window.localStorage });

        // recuperation du formulaire
        const form = screen.getByTestId('form-new-bill');

        // 1iere assertion:  assertion sur les inputs
        //expect(screen.getByTestId('expense-type').value).toBe('');
        expect(screen.getByTestId('expense-name').value).toBe('');
        expect(screen.getByTestId('datepicker').value).toBe('');
        expect(screen.getByTestId('amount').value).toBe('');
        expect(screen.getByTestId('vat').value).toBe('');
        expect(screen.getByTestId('pct').value).toBe('');
        expect(screen.getByTestId('file').value).toBe('');

        // soumission du formulaire
        const handlerSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener('submit', handlerSubmit);
        fireEvent.submit(form);

        // 2ieme assertion: assertion sur le formulaire
        expect(handlerSubmit).toBeCalled();
        expect(form).toBeTruthy();
      })
    });

  })

})


// =======TEST D'INTEGRATION POST====================

describe("GIVEN I CONNECTED AS EMPLOYEE ON NEWBILL PAGE", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  });

  describe("when I click on the submit button and API working", () => {
    test("Then it should send and Mock POST request and return to the bill page", async () => {

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const submitBtn = document.getElementById('btn-send-bill');

      // simulation de la fonction bills
      jest.spyOn(mockStore, 'bills');
      newBill.updateBill = jest.fn();

      const mockedBill = {
        email: "employee@test.tld",
        type: "Restaurants et bars",
        name: "ELEMENT DE TEST",
        amount: 1,
        date: "2023-06-05",
        vat: "1",
        pct: 1,
        commentary: "ELEMENT DE TEST",
        fileUrl: "./Capture.PNG",
        fileName: "Capture.PNG",
        status: "pending"
      }

      screen.getByTestId('expense-type').value = mockedBill.type;
      screen.getByTestId('expense-name').value = mockedBill.name;
      screen.getByTestId('datepicker').value = mockedBill.date;
      screen.getByTestId('amount').value = mockedBill.amount;
      screen.getByTestId('vat').value = mockedBill.vat;
      screen.getByTestId('pct').value = mockedBill.pct;
      screen.getByTestId('commentary').value = mockedBill.commentary;
      newBill.fileName = mockedBill.fileName;
      newBill.fileUrl = mockedBill.fileUrl;

      // Action: soumission du formulaire
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      userEvent.click(submitBtn);

      // assertions 1 : s'assurer que les fonctions sont appelées
      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalledWith( mockedBill );
      expect(mockStore.bills).toHaveBeenCalled();

      // assertion 2: s'assurer qu'on soit retourné a la page Bills
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
    });
  });

  describe('When an error occurs on POST request API', () => {
    test('Then it should console a message error', async () => {

      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      jest.spyOn(mockStore, 'bills');
      console.error = jest.fn();
      // remplacement de la méthode 'bills' de l'ojet 'mockStore' par une implémentation personnalisée
      // cette implémentation sera utillisée sur lors du premier appel à la méthode 'bills'
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'));
          }
        }
      })

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId('form-new-bill');
      const submitBtn = document.getElementById('btn-send-bill');

      //  Action : soumission du formulaire
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      userEvent.click(submitBtn);

      // assertion
      expect(handleSubmit).toHaveBeenCalled();
      await new Promise(process.nextTick);
      expect(console.error).toHaveBeenCalled();
    })
  });
})