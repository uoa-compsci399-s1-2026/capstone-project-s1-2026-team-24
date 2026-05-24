// Shared types for the block-based page builder.
// This module is imported by both server (rendering) and client (admin editor)
// code, so it must contain types and plain data only — no React component imports.

export type BlockCategory =
  | "Hero"
  | "Content"
  | "Dynamic"
  | "Heading"
  | "Study"
  | "Layout";

// Where a block type may be used. "page" blocks appear in the page builder,
// "study" blocks in the study-layout builder, "both" in either.
export type BlockScope = "page" | "study" | "both";

export type FieldType =
  | "text"
  | "textarea"
  | "paragraphArray"
  | "image"
  | "imageArray"
  | "url"
  | "enum"
  | "boolean"
  | "studyCards"
  | "richText";

export interface BlockField {
  key: string;
  label: string;
  type: FieldType;
  /** Allowed values for an "enum" field. */
  options?: readonly string[];
  help?: string;
}

export interface BlockDefinition {
  /** Registry key, also stored in PageBlock.type. */
  type: string;
  /** Human-readable name shown in the admin block picker and card header. */
  label: string;
  category: BlockCategory;
  /** Which builder(s) this block is available in. Defaults to "page". */
  scope?: BlockScope;
  /**
   * When false the block has no editable content (it is "content-frozen"):
   * it can be reordered, hidden, or deleted, but renders fixed markup.
   */
  editable: boolean;
  fields: readonly BlockField[];
  /** Starting content used when an admin inserts a new instance of this block. */
  defaultContent: Record<string, unknown>;
}

/** Shape of a single card inside a `homepageStudies` block. */
export interface StudyCardContent {
  title: string;
  subtitle?: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "center" | "right" | "left" | "top" | "bottom";
}

/** A child block nested inside a `row` column. Rows may not contain rows. */
export interface RowChild {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

/** Content of a `row` block: one or two columns, each an ordered list of children. */
export interface RowContent {
  variant: "oneColumn" | "twoColumn";
  /** [leftColumn, rightColumn]; rightColumn is empty for oneColumn rows. */
  columns: [RowChild[], RowChild[]];
}

/** Hard limits for row content, enforced on write to bound payloads. */
export const ROW_MAX_CHILDREN_PER_COLUMN = 20;
