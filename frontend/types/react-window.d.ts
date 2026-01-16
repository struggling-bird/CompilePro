
declare module 'react-window' {
  import * as React from 'react';

  export interface ListImperativeAPI {
    scrollToRow: (params: { index: number; align?: 'auto' | 'smart' | 'center' | 'end' | 'start' }) => void;
    scrollToItem: (index: number, align?: 'auto' | 'smart' | 'center' | 'end' | 'start') => void;
  }

  export interface ListProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    height?: number | string;
    width?: number | string;
    rowCount?: number;
    rowHeight?: number | ((index: number) => number);
    rowProps?: any;
    rowComponent?: React.ComponentType<any>;
    itemCount?: number;
    itemSize?: number | ((index: number) => number);
    itemData?: any;
    onScroll?: (props: any) => any;
    listRef?: React.Ref<ListImperativeAPI>;
    outerElementType?: React.ElementType;
    innerElementType?: React.ElementType;
  }

  export class FixedSizeList extends React.Component<ListProps> {}
  export class VariableSizeList extends React.Component<ListProps> {}
  
  // v2 exports
  export const List: React.ComponentType<ListProps>;
}
