import React, { useState, useRef, useEffect } from 'react';
import { View, Keyboard, TextInput } from 'react-native';
import {
  int,
  isValidDate,
  formatYearDigits,
  getOnlyNumber,
  getDateDefault,
  daysInMonth,
  dateInRange,
} from './utils';
import Input from './Input';
import type { DateFieldProps } from './types';
import styles from './styles';

const MonthDateYearField: React.FC<DateFieldProps> = (props) => {
  const {
    labelDate = 'Date',
    labelMonth = 'Month',
    labelYear = 'Year',
    editable = true,
    autoFocus,
    value,
    defaultValue,
    hideDate,
    maximumDate,
    minimumDate,
    handleErrors,
    onSubmit,
    testID,
    containerStyle,
    styleInput,
    styleInputYear,
    placeholderTextColor,
  } = props;

  const [state, setState] = useState(getDateDefault(defaultValue));
  const refMonth = useRef<TextInput>(null);
  const refDate = useRef<TextInput>(null);
  const refYear = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) {
      refMonth.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const nextValue = getDateDefault(value);
    if (JSON.stringify(nextValue) !== JSON.stringify(state)) {
      const { date, month, year } = nextValue;
      setState({
        date: date ? date.padStart(2, '0') : '',
        month: month ? month.padStart(2, '0') : '',
        year,
      });
    }
  }, [value, state]);

  const onChangeDate = (value: string) => {
    const date = getOnlyNumber(int(value) > 31 ? '31' : value);
    setState({ ...state, date });
    if (date.length === 2) {
      refYear.current?.focus();
    }
  };

  const onChangeMonth = (value: string) => {
    const month = getOnlyNumber(int(value) > 12 ? '12' : value);
    setState({
      ...state,
      month,
      date: daysInMonth(state),
    });
    if (month.length === 2) {
      refDate.current?.focus();
    }
  };

  const onChangeYear = (value: string) => {
    const year = getOnlyNumber(value);
    setState({ ...state, year });
    if (year.length === 4) {
      Keyboard.dismiss();
    }
  };

  const onBlur = () => {
    const current = { ...state };
    if (int(current.date) === 0) {
      current.date = '01';
    }
    if (current.date.length === 1) {
      current.date = current.date.padStart(2, '0');
    }
    if (int(current.month) === 0) {
      current.month = '01';
    }
    if (current.month.length === 1) {
      current.month = current.month.padStart(2, '0');
    }
    if (int(current.year) === 0) {
      current.year = `${new Date().getFullYear()}`;
    }
    if (current.year.length > 1 && current.year.length < 4) {
      current.year = `${formatYearDigits(int(current.year))}`;
    }
    const value = new Date(
      int(current.year),
      int(current.month) - 1,
      int(current.date)
    );
    if (current.year) {
      if ((minimumDate || maximumDate) && !dateInRange(value, minimumDate, maximumDate)) {
        handleErrors && handleErrors();
        setState({ date: '', month: '', year: '' });
      } else {
        if (isValidDate(value)) {
          onSubmit && onSubmit(value);
        }
        setState({ ...current });
      }
    }
  };

  const { date, month, year } = state;

  return (
    <View {...{ testID }} style={[styles.container, containerStyle]}>
      {!hideDate && (
        <Input
          ref={refMonth}
          value={month}
          placeholder={labelMonth}
          style={styleInput}
          onChangeText={onChangeMonth}
          onSubmitEditing={() => refDate.current?.focus()}
          onBlur={onBlur}
          {...{ editable, placeholderTextColor }}
        />
      )}
      <Input
        ref={refDate}
        value={date}
        placeholder={labelDate}
        style={styleInput}
        onChangeText={onChangeDate}
        onSubmitEditing={() => refYear.current?.focus()}
        onBlur={onBlur}
        {...{ editable, placeholderTextColor }}
      />
      <Input
        ref={refYear}
        value={year}
        maxLength={4}
        returnKeyType="done"
        placeholder={labelYear}
        style={[styleInput, styleInputYear]}
        onChangeText={onChangeYear}
        onSubmitEditing={() => Keyboard.dismiss()}
        onBlur={onBlur}
        {...{ editable, placeholderTextColor }}
      />
    </View>
  );
};

export default MonthDateYearField;
