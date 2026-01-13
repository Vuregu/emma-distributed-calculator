export interface JobPayload {
    jobGroupId: string;
    jobId: string;
    a: number;
    b: number;
    operation: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
}

export type JobResult = {
    jobId: string;
    type: 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';
    result?: number;
    resultInsight?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
};
