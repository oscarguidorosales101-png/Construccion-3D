import type { CADObjectNode } from '../../types/cad';

export type HistoryActionType =
  | 'ADD_OBJECT'
  | 'DELETE_OBJECT'
  | 'UPDATE_TRANSFORM'
  | 'UPDATE_PARAMS'
  | 'UPDATE_MATERIAL'
  | 'SET_VISIBILITY'
  | 'RENAME_OBJECT';

export interface HistoryCommand {
  type: HistoryActionType;
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface SerializableSnapshot {
  objects: Record<string, CADObjectNode>;
  rootIds: string[];
  selectedId: string | null;
}

export class HistoryManager {
  private undoStack: SerializableSnapshot[] = [];
  private redoStack: SerializableSnapshot[] = [];
  private maxDepth = 40;

  constructor(maxDepth: number = 40) {
    this.maxDepth = maxDepth;
  }

  public pushState(snapshot: SerializableSnapshot) {
    // Deep clone state to ensure integrity
    const clone: SerializableSnapshot = JSON.parse(JSON.stringify(snapshot));
    this.undoStack.push(clone);
    if (this.undoStack.length > this.maxDepth) {
      this.undoStack.shift();
    }
    // Any new action clears redo stack
    this.redoStack = [];
  }

  public undo(currentState: SerializableSnapshot): SerializableSnapshot | null {
    if (this.undoStack.length === 0) return null;
    
    // Push current to redo stack
    this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
    const previous = this.undoStack.pop();
    return previous ? JSON.parse(JSON.stringify(previous)) : null;
  }

  public redo(currentState: SerializableSnapshot): SerializableSnapshot | null {
    if (this.redoStack.length === 0) return null;

    // Push current to undo stack
    this.undoStack.push(JSON.parse(JSON.stringify(currentState)));
    const next = this.redoStack.pop();
    return next ? JSON.parse(JSON.stringify(next)) : null;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
