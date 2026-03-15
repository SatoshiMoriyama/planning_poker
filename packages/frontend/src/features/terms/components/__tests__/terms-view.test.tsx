import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TermsView } from '../terms-view';

describe('TermsView', () => {
  it('should display the page title', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '利用規約',
    );
  });

  it('should display the service overview section', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByText('サービスの概要')).toBeInTheDocument();
    expect(
      screen.getByText(/プランニングポーカーツール/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/アカウント登録不要/),
    ).toBeInTheDocument();
  });

  it('should display the data handling section', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByText('データの取り扱い')).toBeInTheDocument();
    expect(
      screen.getByText(/一時的に保存/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/個人情報の永続的な保存は行いません/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cookieやトラッキングは使用しません/),
    ).toBeInTheDocument();
  });

  it('should display the disclaimer section', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByText('免責事項')).toBeInTheDocument();
    expect(
      screen.getByText(/現状のまま/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/中断・終了・変更を予告なく行う/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/損害について責任を負いません/),
    ).toBeInTheDocument();
  });

  it('should display the prohibited actions section', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByText('禁止事項')).toBeInTheDocument();
    expect(
      screen.getByText(/不正アクセスや過度な負荷/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/他のユーザーの利用を妨げる/),
    ).toBeInTheDocument();
  });

  it('should display the terms change section', () => {
    // Given / When
    render(<TermsView />);

    // Then
    expect(screen.getByText('規約の変更')).toBeInTheDocument();
    expect(
      screen.getByText(/予告なく変更される場合があります/),
    ).toBeInTheDocument();
  });

  it('should render all five sections', () => {
    // Given / When
    render(<TermsView />);

    // Then
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(5);
  });
});
