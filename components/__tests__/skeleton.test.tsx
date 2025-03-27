import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton } from '../ui/skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('dark:bg-gray-700');
    expect(skeleton).toHaveClass('h-12');
    expect(skeleton).toHaveClass('w-full');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Skeleton className="w-20 h-20 bg-red-500" />
    );
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('w-20');
    expect(skeleton).toHaveClass('h-20');
    expect(skeleton).toHaveClass('bg-red-500');
  });

  it('renders children when not loading', () => {
    const { getByText } = render(
      <Skeleton isLoading={false}>
        <div>Content</div>
      </Skeleton>
    );
    
    expect(getByText('Content')).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const { container: text } = render(<Skeleton variant="text" />);
    expect(text.firstChild).toHaveClass('h-4');
    expect(text.firstChild).toHaveClass('w-full');
    expect(text.firstChild).toHaveClass('rounded');

    const { container: circular } = render(<Skeleton variant="circular" />);
    expect(circular.firstChild).toHaveClass('rounded-full');
    expect(circular.firstChild).toHaveClass('h-10');
    expect(circular.firstChild).toHaveClass('w-10');

    const { container: avatar } = render(<Skeleton variant="avatar" />);
    expect(avatar.firstChild).toHaveClass('rounded-full');
    expect(avatar.firstChild).toHaveClass('h-12');
    expect(avatar.firstChild).toHaveClass('w-12');

    const { container: button } = render(<Skeleton variant="button" />);
    expect(button.firstChild).toHaveClass('h-10');
    expect(button.firstChild).toHaveClass('w-24');
    expect(button.firstChild).toHaveClass('rounded-md');

    const { container: card } = render(<Skeleton variant="card" />);
    expect(card.firstChild).toHaveClass('h-[200px]');
    expect(card.firstChild).toHaveClass('w-full');
    expect(card.firstChild).toHaveClass('rounded-lg');
  });

  it('renders multiple items with custom gap', () => {
    const { container } = render(
      <Skeleton count={3} gap="1rem" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('flex-col');
    expect(wrapper).toHaveStyle({ gap: '1rem' });

    const skeletons = container.getElementsByClassName('animate-pulse');
    expect(skeletons).toHaveLength(3);
  });
}); 