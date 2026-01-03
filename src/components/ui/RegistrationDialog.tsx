/** @jsxImportSource @emotion/react */
import React, { useEffect, Dispatch, SetStateAction } from 'react';
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Record } from '@/domain/record';
import { css } from '@emotion/react';

// RegistrationDialogコンポーネントに渡す「props（プロパティ）」の型定義（TypeScriptのインターフェース）
interface RegistrationDialogProps {
  // propsとして渡すときも「Record型」として型チェックされます
  // 編集時に渡すレコード（新規登録時はundefined）
  item?: Record;
  button?: string; // "registration"や"modification"など、どのボタンかを判別するための文字列
  // Record型の配列をセットする関数
  // 親コンポーネントのuseStateでデータを更新する関数
  setData: Dispatch<SetStateAction<Record[]>>;
  fetchData: () => void; // データ再取得用の関数
}

interface FormValues {
  studyId: string;
  studyContent: string;
  studyHour: number | null;
}

const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  item,
  button,
  setData, // 新規登録したあと、fetchDataを呼び出すためこちらは使っていない
  fetchData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    // setValueは、react-hook-formで「フォームの特定の値をプログラムから手動でセットする」ための関数
    setValue,
  } = useForm<FormValues>();

  useEffect(() => {
    if (item) {
      setValue('studyId', item.id);
      setValue('studyContent', item.title);
      setValue('studyHour', item.time);
    }
  }, [item, setValue]);

  const addTodo = async (title: string, time: number) => {
    try {
      const res = await fetch('http://localhost:3000/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, time }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`登録失敗: ${errorText}`);
      }
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '不明なエラーが発生しました');
    }
  };

  const updateRecord = async (id: string, title: string, time: number) => {
    try {
      const res = await fetch(`http://localhost:3000/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, time }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`更新失敗: ${errorText}`);
      }
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '不明なエラーが発生しました');
    }
  };

  const onClickCancelRecord = () => {
    reset({
      studyContent: '',
      studyHour: null,
    });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { studyContent, studyHour } = data;
    if (studyHour === null || isNaN(studyHour)) return;
    await addTodo(studyContent, studyHour);
    reset({
      studyContent: '',
      studyHour: null,
    });
  };

  const onSubmitModify: SubmitHandler<FormValues> = async (data) => {
    const { studyId, studyContent, studyHour } = data;
    if (studyHour === null || isNaN(studyHour)) return;
    await updateRecord(studyId, studyContent, studyHour);
    reset({
      studyContent: '',
      studyHour: null,
    });
  };

  const studyContent = watch('studyContent', '');
  const studyHour = watch('studyHour', null);

  if (button === 'registration') {
    return (
      <DialogRoot placement="center">
        <DialogTrigger asChild>
          <Button
            css={css`
              background-color: deepskyblue;
              border-width: 1px;
              border-color: black;
              color: white;
              cursor: pointer;
              padding: 6px 10px;
              font-size: 18px;
              &:hover {
                background-color: darkslategray;
              }
            `}
            data-testid="registration"
          >
            登録
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規登録</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="lg">
                <Stack gap="4" align="flex-start" maxW="sm">
                  <div style={{ width: '100%' }}>
                    <label htmlFor="studyContent">学習内容</label>
                    <Input
                      id="studyContent"
                      type="text"
                      width="100%"
                      {...register('studyContent', { required: '内容の入力は必須です' })}
                    />
                    {errors.studyContent && (
                      <Text color="red.500">{errors.studyContent.message}</Text>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studyHour">学習時間</label>
                    <Input
                      id="studyHour"
                      type="number"
                      {...register('studyHour', {
                        required: '時間の入力は必須です',
                        min: { value: 0, message: '時間は0以上である必要があります' },
                      })}
                    />
                    {errors.studyHour && (
                      <Text color="red.500">{errors.studyHour.message}</Text>
                    )}
                  </div>
                  <div>
                    {studyContent && studyHour !== null && studyHour >= 0 ? (
                      <DialogActionTrigger asChild>
                        <Button
                          type="submit"
                          data-testid="submit"
                          mr={4}
                          css={css`
                            background-color: deepskyblue;
                            border-width: 1px;
                            border-color: black;
                            color: white;
                            cursor: pointer;
                            padding: 6px 10px;
                            width: 80px;
                            &:hover {
                              background-color: darkslategray;
                            }
                          `}
                        >
                          保存
                        </Button>
                      </DialogActionTrigger>
                    ) : (
                      <Button
                        type="submit"
                        data-testid="submit-failure"
                        mr={4}
                        css={css`
                          background-color: deepskyblue;
                          border-width: 1px;
                          border-color: black;
                          color: white;
                          cursor: pointer;
                          padding: 6px 10px;
                          width: 80px;
                          &:hover {
                            background-color: darkslategray;
                          }
                        `}
                      >
                        保存
                      </Button>
                    )}
                    <DialogActionTrigger asChild>
                      <Button
                        css={css`
                          background-color: red;
                          border-width: 1px;
                          border-color: black;
                          color: white;
                          cursor: pointer;
                          padding: 6px 10px;
                          font-size: 12px;
                          width: 80px;
                          &:hover {
                            background-color: darkred;
                          }
                        `}
                        onClick={onClickCancelRecord}
                      >
                        キャンセル
                      </Button>
                    </DialogActionTrigger>
                  </div>
                </Stack>
              </Box>
            </form>
          </DialogBody>
          <DialogCloseTrigger onClick={onClickCancelRecord} />
        </DialogContent>
      </DialogRoot>
    );
  } else if (button === 'modification') {
    return (
      <DialogRoot placement="center">
        <DialogTrigger asChild>
          <Button
            css={css`
              background-color: limegreen;
              border-width: 1px;
              border-color: black;
              color: white;
              cursor: pointer;
              padding: 6px 10px;
              font-size: 18px;
              &:hover {
                background-color: darkgreen;
              }
            `}
            data-testid="modify-registration"
          >
            編集
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記録編集</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form onSubmit={handleSubmit(onSubmitModify)}>
              <Box p={4} borderWidth={1} borderRadius="lg" boxShadow="lg">
                <Stack gap="4" align="flex-start" maxW="sm">
                  <div style={{ width: '100%' }}>
                    <label htmlFor="studyContent">学習内容</label>
                    <Input
                      id="studyContent"
                      type="text"
                      width="100%"
                      {...register('studyContent', { required: '内容の入力は必須です' })}
                    />
                    {errors.studyContent && (
                      <Text color="red.500">{errors.studyContent.message}</Text>
                    )}
                  </div>
                  <div>
                    <label htmlFor="studyHour">学習時間</label>
                    <Input
                      id="studyHour"
                      type="number"
                      {...register('studyHour', {
                        required: '時間の入力は必須です',
                        min: { value: 0, message: '時間は0以上である必要があります' },
                      })}
                    />
                    {errors.studyHour && (
                      <Text color="red.500">{errors.studyHour.message}</Text>
                    )}
                  </div>
                  <div>
                    {studyContent && studyHour !== null && studyHour >= 0 ? (
                      <DialogActionTrigger asChild>
                        <Button
                          type="submit"
                          data-testid="submit-modify"
                          mr={4}
                          css={css`
                            background-color: deepskyblue;
                            border-width: 1px;
                            border-color: black;
                            color: white;
                            cursor: pointer;
                            padding: 6px 10px;
                            width: 80px;
                            &:hover {
                              background-color: darkslategray;
                            }
                          `}
                        >
                          保存
                        </Button>
                      </DialogActionTrigger>
                    ) : (
                      <Button
                        type="submit"
                        data-testid="submit-failure-modify"
                        mr={4}
                        css={css`
                          background-color: deepskyblue;
                          border-width: 1px;
                          border-color: black;
                          color: white;
                          cursor: pointer;
                          padding: 6px 10px;
                          width: 80px;
                          &:hover {
                            background-color: darkslategray;
                          }
                        `}
                      >
                        保存
                      </Button>
                    )}
                    <DialogActionTrigger asChild>
                      <Button
                        css={css`
                          background-color: firebrick;
                          border-width: 1px;
                          border-color: black;
                          color: white;
                          cursor: pointer;
                          padding: 6px 10px;
                          font-size: 12px;
                          width: 80px;
                          &:hover {
                            background-color: darkred;
                          }
                        `}
                        onClick={onClickCancelRecord}
                      >
                        キャンセル
                      </Button>
                    </DialogActionTrigger>
                  </div>
                </Stack>
              </Box>
            </form>
          </DialogBody>
          <DialogCloseTrigger onClick={onClickCancelRecord} />
        </DialogContent>
      </DialogRoot>
    );
  }
  return null;
};

export default RegistrationDialog;