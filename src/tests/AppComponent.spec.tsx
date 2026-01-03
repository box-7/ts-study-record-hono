import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import App from '../App';

it('タイトルをレンダリングする', async () => {
  render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => {
    expect(screen.getByText('学習記録一覧')).toBeInTheDocument();
  }, { timeout: 2000 }); // タイムアウトを延長
});

it('isLoadingがtrueのとき、ローディング・スピナーとテキストを表示する', () => {
  render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
  expect(screen.getByRole('spinnerStatus')).toBeInTheDocument();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('新規登録ボタンがある', async () => {
  render(
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  );
  await waitFor(() => {
    const registerButton = screen.getByRole('button', { name: '登録' });
    expect(registerButton).toBeInTheDocument();
  });
});

// import * as recordLib from '@/lib/record.ts';
// import * as recordLibDelete from '@/lib/record_delete.ts';
// import { v4 as uuidv4 } from 'uuid';

// describe('mockを使ったテスト', () => {
//         jest.mock('@/lib/record.ts');
//         jest.mock('@/lib/record_delete.ts');

//         test('削除ができること', async () => {
//                 const { Record } = jest.requireActual('@/domain/record');
//                 const validUUID1 = uuidv4();
//                 const validUUID2 = uuidv4();
//                 const validUUID3 = uuidv4();
//                 const validUUID4 = uuidv4();
//                 // await waitFor(() => {
//                 jest
//                         .spyOn(recordLib, 'GetAllRecords')
//                         .mockResolvedValueOnce([
//                                 new Record(validUUID1, 'Testtest5', 5),
//                                 new Record(validUUID2, 'Testtest10', 10),
//                         ])
//                         .mockResolvedValueOnce([
//                                 new Record(validUUID2, 'Testtest10', 10),
//                                 new Record(validUUID3, 'Testtest11', 11),
//                                 new Record(validUUID4, 'Testtest12', 12),
//                         ]);

//                 await waitFor(() => {
//                         jest
//                                 .spyOn(recordLibDelete, 'RecordDelete')
//                                 .mockResolvedValueOnce(Promise.resolve());
//                 });

//                 render(
//                         <ChakraProvider value={defaultSystem}>
//                                 <App />
//                         </ChakraProvider>
//                 );

//                 await waitFor(() => {
//                         const dialogTitle = screen.getByText('登録');
//                         expect(dialogTitle).toBeInTheDocument();
//                 });

//                 const deleteButton = await waitFor(() =>
//                         screen.getByTestId(`delete-button-${validUUID1}`)
//                 );

//                 await waitFor(() => {
//                         fireEvent.click(deleteButton);
//                 });
//                 await waitFor(() => {
//                         expect(screen.queryByText('Testtest5 5時間')).not.toBeInTheDocument();
//                 });
//         });

//         test('isLoadingがfalseの場合、データテーブルを表示する', async () => {
//                 const { Record } = jest.requireActual('@/domain/record');
//                 const validUUID1 = uuidv4();
//                 const validUUID2 = uuidv4();
//                 const validUUID3 = uuidv4();
//                 const validUUID4 = uuidv4();
//                 await waitFor(() => {
//                         jest
//                                 .spyOn(recordLib, 'GetAllRecords')
//                                 .mockResolvedValueOnce([
//                                         new Record(validUUID1, 'Testtest51', 51),
//                                         new Record(validUUID2, 'Testtest101', 101),
//                                 ])
//                                 .mockResolvedValueOnce([
//                                         new Record(validUUID2, 'Testtest101', 101),
//                                         new Record(validUUID3, 'Testtest111', 111),
//                                         new Record(validUUID4, 'Testtest121', 121),
//                                 ]);
//                 });
//                 render(
//                         <ChakraProvider value={defaultSystem}>
//                                 <App />
//                         </ChakraProvider>
//                 );
//                 await waitFor(() => {
//                         const dialogTitle = screen.getByText('登録');
//                         expect(dialogTitle).toBeInTheDocument();
//                 });
//                 await waitFor(() => {
//                         expect(screen.getByRole('table')).toBeInTheDocument();
//                 });

//         });
// });

// describe('mockを使ったテスト Jest.mockの書き方', () => {
//         const { Record } = jest.requireActual('@/domain/record');
//         const validUUID1 = uuidv4();
//         const validUUID2 = uuidv4();
//         const validUUID3 = uuidv4();
//         const validUUID4 = uuidv4();
//         jest.mock('@/lib/record.ts', () => {
//                 return {
//                         GetAllRecords: jest
//                                 .fn()
//                                 .mockImplementationOnce(() =>
//                                         Promise.resolve([
//                                                 new Record(validUUID1, 'Testtest5', 5),
//                                                 new Record(validUUID2, 'Testtest10', 10),
//                                         ])
//                                 )
//                                 .mockImplementationOnce(() =>
//                                         Promise.resolve([
//                                                 new Record(validUUID2, 'Testtest10', 10),
//                                                 new Record(validUUID3, 'Testtest15', 15),
//                                                 new Record(validUUID4, 'Testtest20', 20),
//                                         ])
//                                 ),
//                 };
//         });

//         jest.mock('@/lib/record_delete.ts', () => {
//                 return {
//                         RecordDelete: jest
//                                 .fn()
//                                 .mockImplementationOnce(() =>
//                                         Promise.resolve([
//                                                 new Record(validUUID1, 'Testtest5', 5),
//                                                 new Record(validUUID2, 'Testtest10', 10),
//                                                 new Record(validUUID3, 'Testtest15', 15),
//                                                 new Record(validUUID4, 'Testtest20', 20),
//                                         ])
//                                 ),
//                 };
//         });

//         test('削除ができること', async () => {
//                 await waitFor(() => {
//                         jest
//                                 .spyOn(recordLibDelete, 'RecordDelete')
//                                 .mockResolvedValueOnce(Promise.resolve());
//                 });

//                 render(
//                         <ChakraProvider value={defaultSystem}>
//                                 <App />
//                         </ChakraProvider>
//                 );

//                 await waitFor(() => {
//                         const dialogTitle = screen.getByText('登録');
//                         expect(dialogTitle).toBeInTheDocument();
//                 });


//                 await waitFor(() => {
//                         const deleteButton = screen.getAllByRole('button', { name: '削除' })[0];
//                         fireEvent.click(deleteButton);
//                 });

//                 await waitFor(() => {
//                         expect(screen.queryByText('Testtest5 5時間')).not.toBeInTheDocument();
//                 });
//         });
// });

