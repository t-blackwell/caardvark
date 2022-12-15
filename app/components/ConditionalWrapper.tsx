interface ConditionalWrapperProps {
  children: React.ReactNode;
  showWrapper: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
}

export function ConditionalWrapper({
  children,
  showWrapper,
  wrapper,
}: ConditionalWrapperProps) {
  // fragment ensures return type is JSX.Element
  return <>{showWrapper ? wrapper(children) : children}</>;
}
