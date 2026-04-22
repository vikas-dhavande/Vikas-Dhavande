---
name: storybook
description: Use this skill for any tasks involving creating, updating, or maintaining Storybook stories. Triggers for "add a story", "storybook component", or any mention of creating UI component documentation.
---

# Storybook

This skill provides best practices and guidelines for using Storybook in this project.

## Core Principles

1. **Component Story Format (CSF) 3.0**: Use CSF 3.0 for all new stories. It's more concise and easier to write.
2. **Next.js Integration**: The project uses Next.js, so make sure to consider features like `next/font`, `next/image`, and `next/link` when mocking.
3. **Shadcn UI Consistency**: Create stories that showcase components built with Shadcn UI, including light/dark variants and different states.

## Creating a Story (CSF 3.0)

A typical story file should be named `ComponentName.stories.tsx` and placed right next to the component or in a `src/stories` folder depending on project structure.

### Basic Story Example

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button', // Categorize appropriately
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    asChild: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button Text',
    variant: 'default',
    size: 'default',
  },
};

export const Outline: Story = {
  args: {
    ...Default.args,
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    ...Default.args,
    variant: 'destructive',
  },
};
```

## Advanced Patterns

### Decorators
Use decorators to wrap stories with extra markup or context (like a Theme Provider or Layout container).

```tsx
export const WithContainer: Story = {
  decorators: [
    (Story) => (
      <div className="p-10 border rounded-xl bg-muted max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    children: 'Contained Button',
  },
};
```

### Complex Interactions & Mocking
If a component relies on user context or fetching data, try to extract the presentational part of the component so it can be tested in isolation, or mock the required data using Storybook addons or Next.js specific mocking libraries if needed.

For components requiring Next.js Routing, use `next-router-mock` (if configured) or ensure your storybook config handles `next/navigation` appropriately.

## Workflow

1. Always run `npm run storybook` to locally verify your stories render correctly without errors.
2. Ensure you have stories for the `default` state, and any empty, loading, or error states.
3. Keep `args` as dynamic parameters so users can play with the controls in the Storybook UI.
