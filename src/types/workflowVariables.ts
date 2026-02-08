export interface WorkflowVariable {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'url';
    defaultValue: string;
    description: string;
    required: boolean;
}

export interface WorkflowVariableValues {
    [key: string]: string;
}
