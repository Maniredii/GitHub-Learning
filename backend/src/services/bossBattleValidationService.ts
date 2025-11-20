import { RepositoryState } from '../../../shared/src/types';
import { ValidationCriteria } from '../models/Quest';

export interface BossBattleValidationResult {
  success: boolean;
  feedback: string;
  details?: Record<string, any>;
}

export class BossBattleValidationService {
  /**
   * Validate boss battle completion
   */
  validateBossBattle(
    victoryConditions: ValidationCriteria[],
    repositoryState: RepositoryState
  ): BossBattleValidationResult {
    // Check all victory conditions
    let lastSuccessResult: BossBattleValidationResult | null = null;

    for (const condition of victoryConditions) {
      const result = this.validateCondition(condition, repositoryState);
      if (!result.success) {
        return result;
      }
      lastSuccessResult = result;
    }

    // Return the last successful result (which has the details)
    return (
      lastSuccessResult || {
        success: true,
        feedback: 'Victory! You have successfully completed the boss battle!',
      }
    );
  }

  /**
   * Validate a single condition
   */
  private validateCondition(
    condition: ValidationCriteria,
    repositoryState: RepositoryState
  ): BossBattleValidationResult {
    switch (condition.type) {
      case 'custom':
        return this.validateCustomCondition(condition.parameters, repositoryState);
      default:
        return {
          success: false,
          feedback: `Unknown validation type: ${condition.type}`,
        };
    }
  }

  /**
   * Validate custom boss battle conditions
   */
  private validateCustomCondition(
    parameters: Record<string, any>,
    repositoryState: RepositoryState
  ): BossBattleValidationResult {
    const validator = parameters.validator;

    switch (validator) {
      case 'corrupted_timeline':
        return this.validateCorruptedTimeline(parameters, repositoryState);
      case 'convergence_conflict':
        return this.validateConvergenceConflict(parameters, repositoryState);
      default:
        return {
          success: false,
          feedback: `Unknown validator: ${validator}`,
        };
    }
  }

  /**
   * Validate "The Corrupted Timeline" boss battle
   * Player must restore repository to a commit before corruption
   */
  private validateCorruptedTimeline(
    parameters: Record<string, any>,
    repositoryState: RepositoryState
  ): BossBattleValidationResult {
    const requiredCommitHashes = parameters.requiredCommitHashes as string[];

    // Get current HEAD commit
    const currentBranch = repositoryState.branches.find((b) => b.name === repositoryState.head);

    if (!currentBranch) {
      return {
        success: false,
        feedback:
          'Your spell fizzled! The timeline is unstable. Make sure you are on a valid branch.',
        details: {
          issue: 'no_valid_branch',
        },
      };
    }

    const currentCommitHash = currentBranch.commitHash;

    // Check if current commit is one of the required "good" commits
    if (!requiredCommitHashes.includes(currentCommitHash)) {
      return {
        success: false,
        feedback: `The corruption persists! You are currently at commit ${currentCommitHash.substring(0, 7)}, but you need to restore to one of the commits from before the corruption. Use 'git log' to find the Golden Age commits, then use 'git reset --hard <commit>' or 'git checkout <commit>' to restore the timeline.`,
        details: {
          issue: 'wrong_commit',
          currentCommit: currentCommitHash,
          requiredCommits: requiredCommitHashes,
        },
      };
    }

    // Check if working directory matches the commit's tree
    const currentCommit = repositoryState.commits.find((c) => c.hash === currentCommitHash);
    if (!currentCommit) {
      return {
        success: false,
        feedback: 'The timeline is fractured! The commit data is missing.',
        details: {
          issue: 'commit_not_found',
        },
      };
    }

    // Verify working directory matches the restored commit
    const workingDirFiles = Object.keys(repositoryState.workingDirectory);
    const commitTreeFiles = Object.keys(currentCommit.tree);

    for (const file of workingDirFiles) {
      const workingContent = repositoryState.workingDirectory[file].content;
      const commitContent = currentCommit.tree[file]?.content;

      if (workingContent !== commitContent) {
        return {
          success: false,
          feedback: `Almost there! The timeline has been partially restored, but ${file} still contains corrupted data. Make sure your working directory is clean and matches the restored commit.`,
          details: {
            issue: 'working_directory_mismatch',
            file,
          },
        };
      }
    }

    return {
      success: true,
      feedback: `Victory! You have successfully restored the timeline to the Golden Age (commit ${currentCommitHash.substring(0, 7)}). The corruption has been purged, and the Lost Project shines once more!`,
      details: {
        restoredCommit: currentCommitHash,
      },
    };
  }

  /**
   * Validate "The Convergence Conflict" boss battle
   * Player must merge branches and resolve conflicts
   */
  private validateConvergenceConflict(
    parameters: Record<string, any>,
    repositoryState: RepositoryState
  ): BossBattleValidationResult {
    const requiredBranch = parameters.requiredBranch as string;
    const mustHaveMergeCommit = parameters.mustHaveMergeCommit as boolean;
    const fileMustNotHaveConflictMarkers = parameters.fileMustNotHaveConflictMarkers as string;

    // Check if on correct branch
    if (repositoryState.head !== requiredBranch) {
      return {
        success: false,
        feedback: `You must be on the ${requiredBranch} branch to complete this challenge. Use 'git checkout ${requiredBranch}' to switch branches.`,
        details: {
          issue: 'wrong_branch',
          currentBranch: repositoryState.head,
          requiredBranch,
        },
      };
    }

    // Get current branch
    const currentBranch = repositoryState.branches.find((b) => b.name === requiredBranch);
    if (!currentBranch) {
      return {
        success: false,
        feedback: `The ${requiredBranch} branch does not exist!`,
        details: {
          issue: 'branch_not_found',
        },
      };
    }

    // Get current commit
    const currentCommit = repositoryState.commits.find((c) => c.hash === currentBranch.commitHash);
    if (!currentCommit) {
      return {
        success: false,
        feedback: 'The timeline is fractured! The commit data is missing.',
        details: {
          issue: 'commit_not_found',
        },
      };
    }

    // Check if it's a merge commit (has multiple parents)
    if (mustHaveMergeCommit) {
      const hasTwoParents = currentCommit.parents && currentCommit.parents.length === 2;

      if (!hasTwoParents) {
        return {
          success: false,
          feedback:
            'The timelines have not been unified! You need to merge the feature-alternate-story branch into main. Use "git merge feature-alternate-story" to begin the merge, then resolve any conflicts.',
          details: {
            issue: 'no_merge_commit',
            currentCommitParents: currentCommit.parents?.length || (currentCommit.parent ? 1 : 0),
          },
        };
      }
    }

    // Check if file exists and has no conflict markers
    if (fileMustNotHaveConflictMarkers) {
      const file = repositoryState.workingDirectory[fileMustNotHaveConflictMarkers];

      if (!file) {
        return {
          success: false,
          feedback: `The file ${fileMustNotHaveConflictMarkers} is missing from the working directory!`,
          details: {
            issue: 'file_missing',
            file: fileMustNotHaveConflictMarkers,
          },
        };
      }

      // Check for conflict markers
      const conflictMarkers = ['<<<<<<<', '=======', '>>>>>>>'];
      const hasConflictMarkers = conflictMarkers.some((marker) => file.content.includes(marker));

      if (hasConflictMarkers) {
        return {
          success: false,
          feedback: `The conflict in ${fileMustNotHaveConflictMarkers} has not been fully resolved! You must edit the file to remove the conflict markers (<<<<<<<, =======, >>>>>>>) and choose the content you want to keep. Then stage the file with 'git add ${fileMustNotHaveConflictMarkers}' and complete the merge with 'git commit'.`,
          details: {
            issue: 'conflict_markers_present',
            file: fileMustNotHaveConflictMarkers,
          },
        };
      }
    }

    // Check if staging area is clean (merge is complete)
    if (Object.keys(repositoryState.stagingArea).length > 0) {
      return {
        success: false,
        feedback:
          'The merge is not yet complete! You have staged changes but have not committed them. Use "git commit" to finalize the merge.',
        details: {
          issue: 'uncommitted_changes',
        },
      };
    }

    return {
      success: true,
      feedback:
        'Victory! You have successfully unified the parallel timelines! The conflict has been resolved, and both versions of the story now exist in harmony. The Convergence is complete!',
      details: {
        mergeCommit: currentCommit.hash,
      },
    };
  }
}

export default new BossBattleValidationService();
