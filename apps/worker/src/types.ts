export interface JobPayload {
    jobGroupId: string;
    jobId: string;
    a: number;
    b: number;
    operation: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
}

export type JobResult = {
    jobId: string;
    result: number;
    resultInsight?: string;
    status: 'COMPLETED' | 'FAILED';
};
