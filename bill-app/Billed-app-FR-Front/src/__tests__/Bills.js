/**
 * @jest-environment jsdom
 */

import userEvent from '@testing-library/user-event';
import {screen, waitFor} from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { toHaveClass } from "@testing-library/jest-dom";
import { toBeTruthy } from "@testing-library/jest-dom";
import  Bills  from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
// ----------------- TEST UNITAIRE --------------------------------
describe("Given I am connected as an employee", () => {
  // definition de l'employee comme utilisateur courant
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock})
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
  });
  describe("When I am on Bills Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
     // document.body.innerHTML = BillsUI({ data: bills });
     // const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage });

     const root = document.createElement("div")
     root.setAttribute("id", "root")
     document.body.append(root)

      // Act
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Assertion
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')

    })

    test("Then bills should be ordered from earliest to latest", () => {
      // parametre : récupération de la date sur l'interface de Bills
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      // Act: ce qu'on veut faire: on veut trier par ordre d'arrivée
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      // Assertion: ce qu'on veut comme résultat: les date récupérées doivent etre rangées suivant antiChrono
      expect(dates).toEqual(datesSorted);
    })

    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    })

    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' });
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    })
    
    describe('When I click on all eye icons', () => {
      test('Then it should open the modal', () => {
       
        document.body.innerHTML = BillsUI({ data: bills });
        const billsContainer = new Bills({ document, onNavigate, localStorage: window.localStorage });

        $.fn.modal = jest.fn();

        // recupération des éléments
        const eyeIconTab = screen.getAllByTestId('icon-eye');
        const openModal = jest.fn(billsContainer.handleClickIconEye);
        const modal = screen.getByTestId('modalFileEmployee');

        eyeIconTab.forEach((icon) => {
          icon.addEventListener('click', (e) => openModal(icon))
          userEvent.click(icon);
        })

        // Assertion sur la structure html
        expect(modal).toBeTruthy() // le code html de la page est présent dans la page
        expect(screen.getByText("Justificatif")).toBeTruthy() // le mot "Justificatif" est bien dans la page html

        // Assertion : click pour voir l'image
        const img = screen.getByTestId("modalBillImg");
        expect(img).toHaveAttribute('src', bills[1].fileUrl); // Vérifiez l’URL du fichier du dernier appel

        // Assertion : click pour la fonction d'appel
        expect($.fn.modal).toHaveBeenCalledWith('show'); // verifier si la fonction "modal" est bien appelé avec un l'argument "show"
        expect(openModal).toHaveBeenCalledTimes(eyeIconTab.length); // la fonction call back de l'evennement a été appelé autant de fois que le nombre de click
      })
    })

    describe("When I click on the New Bil Button", () => {

      test("Then It Should open the NewBill Form", () => {
        // chqrgement des element sur l'interface
       document.body.innerHTML = BillsUI({data: bills}) 
       const billContainer = new Bills({document, onNavigate, localStorage: window.localStorage});

       // recuperqtion des elements charger sur l'interface
       const functionOpenNewBill = jest.fn((e) => billContainer.handleClickNewBill);
       const btnNewBill = screen.getByTestId("btn-new-bill");

       // Act
       btnNewBill.addEventListener("click", functionOpenNewBill);
       userEvent.click(btnNewBill);

       // Assertions
       expect(functionOpenNewBill).toHaveBeenCalled();
       expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
       expect(screen.getByTestId('form-new-bill')).toBeTruthy();
      })
    })
  }) // fin des tes pour la page bills
}) // fin des test unitaires du parcour employee

// ----------TEST D'INTEGRATION GET --------
describe('Given I a user connected as employee', () => {

  beforeAll(() => {
   Object.defineProperty(window, 'localStorage', {value: localStorageMock});
   window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));
  })
  describe('When I Navigate to Bills Page', () => {
    test('Then it fetch bills from mock API GET', async () => {
      document.body.innerHTML = BillsUI({data: bills});
      const conteneurFactures = new Bills({document, onNavigate, store: mockStore, localStorage: window.localStorage});
      await waitFor(() => screen.getByText('Mes notes de frais'));

      // Act
      const chargementFactures = await conteneurFactures.getBills();

      // Assertions
      expect(screen.getByText('Mes notes de frais')).toBeTruthy();
      expect(chargementFactures.length).toBe(4);
    })
  });

  describe("L'orsqu'une erreur se produit lors de l'appel de l'API", () => {
    beforeEach(() => {
      // On declare un observable, qui surveillera la fonction bills de mockStore
      // (simulation du comportement de la fonction bills)
      jest.spyOn(mockStore, 'bills');

      // parametrage globale
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      router();
    });

  test("fetches bills from an API and fails with 404 message error", async () => {
    // Les factures fictives (simulé ci-dessus) fonctionnent avec une promesse rejetée
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error('Erreur 404'))
        }
      }
    });

    // Act
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);

    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  })

  test("fetches bills from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error('Erreur 500'));
        }
      }
    });

    // Act
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);

    const messages = await screen.getByText(/Erreur 500/);
    expect(messages).toBeTruthy();
  })
  })
})
