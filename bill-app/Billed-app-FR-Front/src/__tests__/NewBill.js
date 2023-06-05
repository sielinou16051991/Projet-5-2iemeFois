/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import { toHaveClass } from "@testing-library/jest-dom";
import mockStore from "../__mocks__/store";

const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname})}
describe("Given I am connected as an employee", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock});
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee' }));
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
        const loardFile = new File(['test-file'], 'test-file.txt', {type: 'text/plain'});

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
        userEvent.upload(inputFile, formatGoodFile );

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
        const newBill = new NewBill({document, onNavigate, localStorage: window.localStorage});

        // recuperation du formulaire
        const form = screen.getByTestId('form-new-bill');

        // 1iere assertion:  assertion sur les inputs
        expect(screen.getByTestId('expense-type').value).toBe('');
        expect(form.getByTestId('expense-name').value).toBe('');
        expect(screen.getByTestId('datepicker').value).toBe('');
        expect(screen.getByTestId('amount').value).toBe('');
        expect(screen.getByTestId('vat').value).toBe('');
        expect(screen.getByTestId('pct').value).toBe('');
        expect(screen.getByTestId('file').value).toBe('');

        // soumission du formulaire
        const handlerSobmit = jest.fn((e) => newBill.handlerSubmit(e));
        form.addEventListener('submit', handlerSobmit);
        fireEvent(form);

        // 2ieme assertion: assertion sur le formulaire
        expect(handlerSobmit).toBeCalled();
        expect(form).toBeTruthy();
      })
    });

  })
})
